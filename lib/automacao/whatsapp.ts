// Envio no WhatsApp pela Evolution API (roda no Railway, conectada por QR a um chip próprio).
// Liga só quando EVOLUTION_URL, EVOLUTION_KEY e EVOLUTION_INSTANCE estão nas variáveis da Vercel.
const base = (process.env.EVOLUTION_URL ?? "").replace(/\/$/, "");
const key = process.env.EVOLUTION_KEY ?? "";
const instancia = process.env.EVOLUTION_INSTANCE ?? "";

export const whatsLigado = () => !!(base && key && instancia);

/** É um destino de WhatsApp? (JID de grupo termina em @g.us) */
export const ehGrupoWhats = (chat: string) => /@(g\.us|s\.whatsapp\.net)$/i.test(chat.trim());

async function chamar(caminho: string, corpo: unknown) {
  const r = await fetch(`${base}/${caminho}/${instancia}`, {
    method: "POST",
    headers: { "content-type": "application/json", apikey: key },
    body: JSON.stringify(corpo),
    signal: AbortSignal.timeout(25000),
  });
  const j = (await r.json().catch(() => ({}))) as { message?: string; error?: string; status?: string };
  if (!r.ok) throw new Error(traduzir(j.message || j.error || `Evolution respondeu ${r.status}`));
  return j;
}

/** Posta no grupo: foto com legenda, ou só texto quando não tem foto. */
export async function postarWhats(grupo: string, texto: string, foto?: ArrayBuffer | null) {
  const number = grupo.trim();
  if (foto) {
    const base64 = Buffer.from(foto).toString("base64");
    await chamar("message/sendMedia", { number, mediatype: "image", mimetype: "image/png", fileName: "oferta.png", caption: texto, media: base64 });
    return;
  }
  await chamar("message/sendText", { number, text: texto });
}

/** Grupos do WhatsApp do número conectado (pra escolher onde postar). */
export async function listarGruposWhats(): Promise<{ id: string; nome: string }[]> {
  const r = await fetch(`${base}/group/fetchAllGroups/${instancia}?getParticipants=false`, {
    headers: { apikey: key },
    signal: AbortSignal.timeout(25000),
  });
  if (!r.ok) throw new Error(`Evolution respondeu ${r.status}`);
  const j = (await r.json().catch(() => [])) as { id?: string; subject?: string }[];
  return (Array.isArray(j) ? j : []).filter((g) => g.id).map((g) => ({ id: g.id!, nome: g.subject || g.id! }));
}

function traduzir(m: string) {
  if (/not found|instance/i.test(m)) return "Número do WhatsApp não conectado na Evolution (leia o QR de novo)";
  if (/not.*group|participant|forbidden/i.test(m)) return "O número precisa ser administrador do grupo pra postar";
  return m;
}

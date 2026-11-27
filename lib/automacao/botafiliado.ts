// Bot do Afiliado (botdoafiliado.com): converte o link do produto no link de afiliado da conta do Barr4k
// (gerado pela sessão do Mercado Livre que a extensão deles mantém). Só roda se a chave estiver na Vercel.
// Docs: https://botdoafiliado.com/docs/api/convert-links/

export const botAfiliadoLigado = () => !!process.env.BOT_AFILIADO_API_KEY;

/** Devolve o link pra divulgar (final_url, senão affiliate_url) ou null se não deu. */
export async function converterLink(url: string): Promise<string | null> {
  const chave = process.env.BOT_AFILIADO_API_KEY;
  if (!chave) return null;
  try {
    const r = await fetch("https://botdoafiliado.com/api/v1/convert-links", {
      method: "POST",
      headers: { "content-type": "application/json", "X-API-Key": chave },
      body: JSON.stringify({ url, origem: { tipo: "canal", id: "achou_ofertas" } }),
      signal: AbortSignal.timeout(20000),
    });
    const j = (await r.json().catch(() => null)) as { success?: boolean; final_url?: string | null; affiliate_url?: string | null } | null;
    if (!r.ok || !j?.success) {
      console.error("[bot-afiliado]", r.status, JSON.stringify(j)?.slice(0, 300));
      return null;
    }
    const link = j.final_url || j.affiliate_url;
    return link && /^https?:\/\//.test(link) ? link : null;
  } catch (e) {
    console.error("[bot-afiliado]", (e as Error).message);
    return null;
  }
}

// Telegram: lê canais públicos pela página t.me/s/<canal> (sem login) e posta pelo bot.

export type Post = { id: number; chave: string; texto: string; links: string[] };

const ent = (s: string) =>
  s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&nbsp;/g, " ");

export const nomeCanal = (chat: string) =>
  chat.trim().replace(/^https?:\/\/t\.me\/(s\/)?/i, "").replace(/^@/, "").replace(/\/.*$/, "");

/** Posts mais recentes de um canal público (mais antigo primeiro). */
export async function lerCanal(chat: string): Promise<Post[]> {
  const canal = nomeCanal(chat);
  const r = await fetch(`https://t.me/s/${encodeURIComponent(canal)}`, {
    headers: { "user-agent": "Mozilla/5.0", "accept-language": "pt-BR" },
    signal: AbortSignal.timeout(10000),
    cache: "no-store",
  });
  if (!r.ok) throw new Error(`t.me/s/${canal} respondeu ${r.status}`);
  const html = await r.text();
  const posts: Post[] = [];
  for (const bloco of html.split('data-post="').slice(1)) {
    const chave = bloco.slice(0, bloco.indexOf('"'));
    const id = Number(chave.split("/")[1]);
    if (!id) continue;
    const m = bloco.match(/js-message_text[^>]*>([\s\S]*?)<\/div>/);
    const bruto = m?.[1] ?? "";
    const links = [...bruto.matchAll(/href="([^"]+)"/g)].map((x) => ent(x[1]));
    const preview = bloco.match(/tgme_widget_message_link_preview"\s+href="([^"]+)"/)?.[1];
    if (preview) links.push(ent(preview));
    const texto = ent(bruto.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, "")).trim();
    posts.push({ id, chave, texto, links: [...new Set(links)] });
  }
  return posts.sort((a, b) => a.id - b.id);
}

/** ~riscado~ e *negrito* pro HTML do Telegram. */
export function paraHtml(texto: string) {
  const esc = texto.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return esc.replace(/~([^~\n]+)~/g, "<s>$1</s>").replace(/\*([^*\n]+)\*/g, "<b>$1</b>");
}

export async function postar(token: string, chat: string, texto: string) {
  const alvo = /^-?\d+$/.test(chat.trim()) ? chat.trim() : `@${nomeCanal(chat)}`;
  const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      chat_id: alvo,
      text: paraHtml(texto),
      parse_mode: "HTML",
      link_preview_options: { prefer_large_media: true, show_above_text: true },
    }),
    signal: AbortSignal.timeout(15000),
  });
  const j = (await r.json().catch(() => ({}))) as { ok?: boolean; description?: string };
  if (!j.ok) throw new Error(traduzir(j.description ?? `Telegram respondeu ${r.status}`));
}

function traduzir(m: string) {
  if (/chat not found/i.test(m)) return "Canal não encontrado: confira o @ e se o bot é administrador dele";
  if (/not enough rights|administrator|forbidden/i.test(m)) return "O bot não tem permissão: coloque ele como administrador do canal";
  if (/unauthorized/i.test(m)) return "Token do bot inválido";
  return m;
}

// Telegram: lê canais públicos pela página t.me/s/<canal> (sem login) e posta pelo bot.

export type Post = { id: number; chave: string; texto: string; links: string[] };

const ent = (s: string) =>
  s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#x([0-9a-f]+);/gi, (_m, h: string) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_m, d: string) => String.fromCodePoint(Number(d)));

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

/** Link longo vira um link clicável com texto curto (ex.: mercadolivre.com.br/MLB123). */
function rotulo(url: string) {
  try {
    const u = new URL(url);
    const id = url.match(/MLBU?\d+/)?.[0];
    const host = u.hostname.replace(/^www\./, "");
    return id ? `${host}/${id}` : url.length > 60 ? `${host}${u.pathname.slice(0, 30)}…` : url;
  } catch {
    return url;
  }
}

/** ~riscado~, *negrito* e links pro HTML do Telegram. */
export function paraHtml(texto: string) {
  const esc = (x: string) => x.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const links: string[] = [];
  const semLinks = texto.replace(/https?:\/\/[^\s<>"]+/g, (u) => {
    links.push(u);
    return "\u0001L" + (links.length - 1) + "\u0001";
  });
  return esc(semLinks)
    .replace(/~([^~\n]+)~/g, "<s>$1</s>")
    .replace(/\*([^*\n]+)\*/g, "<b>$1</b>")
    .replace(/\u0001L(\d+)\u0001/g, (_m, i: string) => `<a href="${esc(links[Number(i)])}">${esc(rotulo(links[Number(i)]))}</a>`);
}

const alvoDe = (chat: string) => (/^-?\d+$/.test(chat.trim()) ? chat.trim() : `@${nomeCanal(chat)}`);

async function resposta(r: Response) {
  const j = (await r.json().catch(() => ({}))) as { ok?: boolean; description?: string };
  if (!j.ok) throw new Error(traduzir(j.description ?? `Telegram respondeu ${r.status}`));
}

export async function postar(token: string, chat: string, texto: string) {
  const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      chat_id: alvoDe(chat),
      text: paraHtml(texto),
      parse_mode: "HTML",
      link_preview_options: { is_disabled: true },
    }),
    signal: AbortSignal.timeout(15000),
  });
  await resposta(r);
}

/** Foto com legenda (limite do Telegram: 1024 caracteres na legenda). */
export async function postarFoto(token: string, chat: string, foto: ArrayBuffer, texto: string) {
  const html = paraHtml(texto);
  if (html.replace(/<[^>]+>/g, "").length > 1024) return postar(token, chat, texto);
  const f = new FormData();
  f.set("chat_id", alvoDe(chat));
  f.set("caption", html);
  f.set("parse_mode", "HTML");
  f.set("photo", new Blob([foto], { type: "image/png" }), "oferta.png");
  const r = await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, { method: "POST", body: f, signal: AbortSignal.timeout(20000) });
  await resposta(r);
}

function traduzir(m: string) {
  if (/chat not found/i.test(m)) return "Canal não encontrado: confira o @ e se o bot é administrador dele";
  if (/not enough rights|administrator|forbidden/i.test(m)) return "O bot não tem permissão: coloque ele como administrador do canal";
  if (/unauthorized/i.test(m)) return "Token do bot inválido";
  return m;
}

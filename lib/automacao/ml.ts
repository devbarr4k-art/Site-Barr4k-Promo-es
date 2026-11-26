// Mercado Livre: abre o link de quem postou (meli.la, mercadolivre.com/sec...), acha o produto
// e devolve o link do produto com os parâmetros de afiliado da ACHOU.

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131 Safari/537.36";
const RASTREIO = /^(matt_|utm_|c_|polycard|reco_|tracking_id|source$|sid$|wid$|forceInApp|ref$|pdp_filters$|searchVariation)/;

export const ehLinkML = (u: string) => /(^|\.)(meli\.la|mercadolivre\.com(\.br)?|mercadolibre\.com)$/i.test(hostDe(u));

function hostDe(u: string) {
  try {
    return new URL(u).hostname;
  } catch {
    return "";
  }
}

/** Segue redirecionamentos até a página final do Mercado Livre. */
export async function abrir(url: string): Promise<string> {
  let atual = url;
  for (let i = 0; i < 6; i++) {
    const r = await fetch(atual, { redirect: "manual", headers: { "user-agent": UA }, signal: AbortSignal.timeout(8000) }).catch(() => null);
    const prox = r?.headers.get("location");
    if (!prox || /account-verification/.test(prox)) break;
    atual = new URL(prox, atual).toString();
  }
  return atual;
}

/** matt_tool / matt_word de um link de afiliado (aceita o link curto). */
export async function lerParamsAfiliado(link: string) {
  const final = await abrir(link.trim());
  const u = new URL(final);
  return { matt_tool: u.searchParams.get("matt_tool") ?? "", matt_word: u.searchParams.get("matt_word") ?? "" };
}

const decod = (s: string) => s.replace(/&amp;/g, "&");
const desesc = (s: string) => s.replace(/\u002F/g, "/").replace(/&amp;/g, "&");

export type Produto = { url: string; imagem: string | null; titulo: string | null; preco: number | null };

/** Abre o link de quem postou e devolve o produto: link, foto, nome e preço (quando a vitrine mostra). */
export async function lerProduto(url: string): Promise<Produto | null> {
  const final = await abrir(url);
  const u = new URL(final);
  if (/\/(MLB-?\d+|p\/MLB\d+|up\/MLBU\d+)/i.test(u.pathname) && !/\/social\//.test(u.pathname))
    return { url: final, imagem: null, titulo: null, preco: null };
  // vitrine social: o produto da oferta é o "card-featured"
  const html = await fetch(final, { headers: { "user-agent": UA, "accept-language": "pt-BR" }, signal: AbortSignal.timeout(10000) })
    .then((r) => r.text())
    .catch(() => "");
  const links = [...html.matchAll(/https:\/\/www\.mercadolivre\.com\.br\/[^"\\\s]+?(?:\/up\/MLBU\d+|\/p\/MLB\d+|MLB-\d+)[^"\\\s]*/g)].map((m) => decod(m[0]));
  // o produto compartilhado vem em "shared_item"; o link certo é o que tem esse código
  const comp = html.match(/"shared_item":\{"id":"MLB(\d+)"/)?.[1];
  const doItem = comp
    ? links.find((l) => new RegExp(`(/p/MLB${comp}|item_id(%3A|:)MLB${comp}|MLB-${comp})(\\D|$)`).test(l))
    : undefined;
  const destaque = doItem ?? links.find((l) => /card-featured/.test(l)) ?? links[0];
  if (!destaque) return null;
  const meta = (k: string) => html.match(new RegExp(`property="${k}" content="([^"]+)"`))?.[1] ?? null;
  const ogTitulo = meta("og:title");
  const img = meta("og:image");
  const preco = ogTitulo?.match(/R\$\s*([\d.]+(?:,\d{2})?)\s*$/)?.[1];
  return {
    url: destaque,
    // o gerador de imagem não lê webp: o mesmo arquivo existe em jpg
    imagem: img ? desesc(img).replace(/-[A-Z]\.webp$/, "-O.jpg") : null,
    titulo: ogTitulo ? desesc(ogTitulo).replace(/\s*-\s*R\$.*$/, "").trim() : null,
    preco: preco ? Number(preco.replace(/\./g, "").replace(",", ".")) : null,
  };
}

/** Só o link do produto (compatível com o uso antigo). */
export async function acharProduto(url: string): Promise<string | null> {
  return (await lerProduto(url))?.url ?? null;
}

/** Link final: produto limpo + parâmetros da ACHOU. */
export function linkAfiliado(produto: string, p: { matt_tool: string; matt_word: string }) {
  const u = new URL(produto);
  u.hash = "";
  for (const k of [...u.searchParams.keys()]) if (RASTREIO.test(k) || !u.searchParams.get(k)) u.searchParams.delete(k);
  const item = produto.match(/item_id(?:%3A|:)(MLB\d+)/i)?.[1];
  if (item && /\/up\//.test(u.pathname)) u.searchParams.set("pdp_filters", `item_id:${item}`);
  u.searchParams.set("matt_tool", p.matt_tool);
  if (p.matt_word) u.searchParams.set("matt_word", p.matt_word);
  return u.toString();
}

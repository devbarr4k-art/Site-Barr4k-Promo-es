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

/** Acha o link do produto: direto (produto/MLB) ou dentro da vitrine "social" do afiliado. */
export async function acharProduto(url: string): Promise<string | null> {
  const final = await abrir(url);
  const u = new URL(final);
  if (/\/(MLB-?\d+|p\/MLB\d+|up\/MLBU\d+)/i.test(u.pathname) && !/\/social\//.test(u.pathname)) return final;
  // vitrine social: o produto da oferta é o "card-featured"
  const html = await fetch(final, { headers: { "user-agent": UA, "accept-language": "pt-BR" }, signal: AbortSignal.timeout(10000) })
    .then((r) => r.text())
    .catch(() => "");
  const links = [...html.matchAll(/https:\/\/www\.mercadolivre\.com\.br\/[^"\\\s]+?(?:\/up\/MLBU\d+|\/p\/MLB\d+|MLB-\d+)[^"\\\s]*/g)].map((m) => decod(m[0]));
  const destaque = links.find((l) => /card-featured/.test(l)) ?? links[0];
  return destaque ?? null;
}

/** Link final: produto limpo + parâmetros da ACHOU. */
export function linkAfiliado(produto: string, p: { matt_tool: string; matt_word: string }) {
  const u = new URL(produto);
  u.hash = "";
  for (const k of [...u.searchParams.keys()]) if (RASTREIO.test(k)) u.searchParams.delete(k);
  const item = produto.match(/item_id(?:%3A|:)(MLB\d+)/i)?.[1];
  if (item && /\/up\//.test(u.pathname)) u.searchParams.set("pdp_filters", `item_id:${item}`);
  u.searchParams.set("matt_tool", p.matt_tool);
  if (p.matt_word) u.searchParams.set("matt_word", p.matt_word);
  return u.toString();
}

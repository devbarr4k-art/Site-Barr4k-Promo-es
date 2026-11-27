// Gera o link de afiliado curto (meli.la) na conta do próprio dono, usando a sessão que a
// extensão da ACHOU envia do navegador dele (os mesmos cookies do "Compartilhar" do site).
// Nada disso roda sem o dono instalar a extensão e conectar: é a conta dele, autorizada por ele.
import { db } from "./db";

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131 Safari/537.36";
const PORTAL = "https://www.mercadolivre.com.br/afiliados/linkbuilder";
const CRIAR = "https://www.mercadolivre.com.br/affiliate-program/api/v2/affiliates/createLink";

/** Acha o csrf na página do portal de afiliados. */
async function pegarCsrf(cookies: string): Promise<string | null> {
  const r = await fetch(PORTAL, {
    headers: { cookie: cookies, "user-agent": UA, accept: "text/html", "accept-language": "pt-BR,pt;q=0.9" },
    redirect: "manual",
    signal: AbortSignal.timeout(12000),
  });
  if (r.status >= 300 && r.status < 400) return "sessao-expirada";
  const html = await r.text().catch(() => "");
  const m =
    html.match(/["']?csrf[-_]?token["']?\s*[:=]\s*["']([^"']{10,})["']/i) ??
    html.match(/name=["']csrf-token["']\s+content=["']([^"']+)["']/i);
  return m?.[1] ?? null;
}

const soCookiesMl = (cookies: string) =>
  cookies
    .split(/;\s*/)
    .map((c) => c.trim())
    .filter(Boolean)
    .join("; ");

/** Resultado da geração. `expirou` avisa o painel pra pedir reconexão da extensão. */
export type MeliResultado = { link: string } | { erro: string; expirou?: boolean };

/** Gera o meli.la de um produto. `cookies`/`tag` da sessão guardada. */
export async function gerarMeli(url: string, cookies: string, tag: string): Promise<MeliResultado> {
  const ck = soCookiesMl(cookies);
  if (!ck) return { erro: "sem sessão do Mercado Livre", expirou: true };

  const chamar = async (csrf: string | null) => {
    const headers: Record<string, string> = {
      "content-type": "application/json",
      accept: "application/json, text/plain, */*",
      "accept-language": "pt-BR,pt;q=0.9",
      cookie: ck,
      origin: "https://www.mercadolivre.com.br",
      referer: PORTAL,
      "user-agent": UA,
    };
    if (csrf) headers["x-csrf-token"] = csrf;
    return fetch(CRIAR, {
      method: "POST",
      headers,
      body: JSON.stringify({ urls: [url], tag }),
      redirect: "manual",
      signal: AbortSignal.timeout(15000),
    });
  };

  try {
    let csrf = await pegarCsrf(ck);
    if (csrf === "sessao-expirada") return { erro: "a sessão do Mercado Livre expirou", expirou: true };
    let r = await chamar(csrf);
    // sessão/token velho: pega o csrf de novo e tenta mais uma vez
    if (r.status === 401 || r.status === 403 || r.status === 419 || (r.status >= 300 && r.status < 400)) {
      csrf = await pegarCsrf(ck);
      if (csrf === "sessao-expirada") return { erro: "a sessão do Mercado Livre expirou", expirou: true };
      r = await chamar(csrf);
    }
    if (r.status === 401 || (r.status >= 300 && r.status < 400)) return { erro: "a sessão do Mercado Livre expirou", expirou: true };
    const j = (await r.json().catch(() => null)) as { urls?: { short_url?: string; message?: string }[] } | null;
    const item = j?.urls?.[0];
    const link = item?.short_url;
    if (link && /^https:\/\/meli\.la\//.test(link)) return { link };
    return { erro: item?.message || `Mercado Livre respondeu ${r.status}` };
  } catch (e) {
    return { erro: (e as Error).message };
  }
}

/** Gera o meli.la usando a sessão guardada no banco; marca erro de expiração pro painel. */
export async function gerarMeliDaSessao(url: string): Promise<string | null> {
  const { data } = await db().from("auto_config").select("ml_cookies, ml_matt_word").eq("id", 1).maybeSingle();
  const cookies = (data as { ml_cookies?: string } | null)?.ml_cookies;
  const tag = (data as { ml_matt_word?: string } | null)?.ml_matt_word;
  if (!cookies || !tag) return null;
  const r = await gerarMeli(url, cookies, tag);
  if ("link" in r) {
    await db().from("auto_config").update({ ml_sessao_erro: null }).eq("id", 1);
    return r.link;
  }
  await db()
    .from("auto_config")
    .update({ ml_sessao_erro: r.expirou ? "Reconecte a extensão: a sessão do Mercado Livre expirou." : r.erro })
    .eq("id", 1);
  return null;
}

export const sessaoLigada = async () => {
  const { data } = await db().from("auto_config").select("ml_cookies").eq("id", 1).maybeSingle();
  return !!(data as { ml_cookies?: string } | null)?.ml_cookies;
};

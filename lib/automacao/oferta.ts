// Mensagem de oferta → texto pronto com o link de afiliado da ACHOU (só Mercado Livre).
import { brl, desconto, extrair } from "./extrair";
import { acharProduto, ehLinkML, linkAfiliado } from "./ml";

export const TEMPLATE_PADRAO = `🔥 {titulo}
[[se preco_antigo]]
~De {preco_antigo}~[[/se]]
[[se preco]]✅ Por {preco}[[/se]][[se desconto]] ({desconto} OFF)[[/se]]
[[se cupom]]
🎟️ Cupom: {cupom}[[/se]]

🛒 Mercado Livre: {link}`;

export function montar(template: string, v: Record<string, string>) {
  return template
    .replace(/\[\[se ([a-z_]+)\]\]([\s\S]*?)\[\[\/se\]\]/g, (_m, n: string, d: string) => (v[n] ? d : ""))
    .replace(/\{([a-z_]+)\}/g, (_m, n: string) => v[n] ?? "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

const norm = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

export type Resultado =
  | { ok: true; texto: string; linkOriginal: string; linkAfiliado: string }
  | { ok: false; motivo: string; linkOriginal?: string };

export async function processar(
  mensagem: string,
  linksExtras: string[],
  cfg: { ml_matt_tool: string; ml_matt_word: string; template: string; palavras_bloqueadas: string[] },
): Promise<Resultado> {
  const bloq = cfg.palavras_bloqueadas.find((p) => p.trim() && norm(mensagem).includes(norm(p.trim())));
  if (bloq) return { ok: false, motivo: `palavra bloqueada: ${bloq}` };
  const ex = extrair(mensagem);
  const links = [...new Set([...ex.links, ...linksExtras])].filter(ehLinkML);
  if (!links.length) return { ok: false, motivo: "sem link do Mercado Livre" };
  if (!cfg.ml_matt_tool) return { ok: false, motivo: "configure o link de afiliado do Mercado Livre", linkOriginal: links[0] };

  const produto = await acharProduto(links[0]).catch(() => null);
  if (!produto) return { ok: false, motivo: "não deu pra abrir o produto no Mercado Livre", linkOriginal: links[0] };
  const link = linkAfiliado(produto, { matt_tool: cfg.ml_matt_tool, matt_word: cfg.ml_matt_word });
  const off = desconto(ex.preco, ex.precoAntigo);
  const texto = montar(cfg.template || TEMPLATE_PADRAO, {
    titulo: ex.titulo || "Oferta no Mercado Livre",
    preco: ex.preco ? brl(ex.preco) : "",
    preco_antigo: ex.precoAntigo ? brl(ex.precoAntigo) : "",
    desconto: off ? `${off}%` : "",
    cupom: ex.cupom ?? "",
    link,
    loja: "Mercado Livre",
  });
  return { ok: true, texto, linkOriginal: links[0], linkAfiliado: link };
}

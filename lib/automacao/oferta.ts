// Mensagem de oferta → texto pronto com o link de afiliado da ACHOU (só Mercado Livre).
import { brl, desconto, extrair } from "./extrair";
import { ehLinkML, lerProduto, linkAfiliado } from "./ml";
import { linkCurto } from "./curto";

export const TEMPLATE_PADRAO = `[[se chamada]]{chamada}

[[/se]]🔥 *{titulo}*
[[se preco_antigo]]
De: ~{preco_antigo}~[[/se]][[se preco]]
Por: *{preco}*[[/se]][[se desconto]] ({desconto} OFF)[[/se]][[se pix]] no Pix[[/se]][[se economia]]
💰 Você economiza {economia}[[/se]][[se loja_oficial]]
✅ Vendido por loja oficial[[/se]][[se cupom]]

🎟️ Cupom: *{cupom}*[[/se]]

🛒 Compre aqui *Mercado Livre* 👇
{link}
[[se cupom]]
ℹ️ Pra pegar o desconto, aplique o cupom {cupom} no carrinho.[[/se]]
{fechamento} #Publi`;

const FECHAMENTOS = [
  "⚡ Corre que é por tempo limitado!",
  "⏳ O preço pode subir a qualquer momento.",
  "🏃 Estoque voando, garanta o seu!",
  "👀 Achou? Então aproveita!",
  "🔔 Ofertas assim acabam rápido.",
];

export function montar(template: string, v: Record<string, string>) {
  return template
    .replace(/\[\[se ([a-z_]+)\]\]([\s\S]*?)\[\[\/se\]\]/g, (_m, n: string, d: string) => (v[n] ? d : ""))
    .replace(/\{([a-z_]+)\}/g, (_m, n: string) => v[n] ?? "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

const norm = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

// a chamada é só o nome do produto de novo? (ignora emoji, pontuação e maiúsculas)
const so = (x: string) => norm(x).replace(/[^a-z0-9]+/g, "");
const semelhante = (a: string, b: string) => {
  const x = so(a), y = so(b);
  return !x || x === y || y.startsWith(x.slice(0, 24)) || x.startsWith(y.slice(0, 24));
};

export type Resultado =
  | { ok: true; texto: string; linkOriginal: string; linkAfiliado: string; imagem: string | null }
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

  const produto = await lerProduto(links[0]).catch(() => null);
  if (!produto) return { ok: false, motivo: "não deu pra abrir o produto no Mercado Livre", linkOriginal: links[0] };
  const link = linkAfiliado(produto.url, { matt_tool: cfg.ml_matt_tool, matt_word: cfg.ml_matt_word });
  const preco = ex.preco ?? produto.preco;
  // "De": o do post; se não tiver, o preço riscado que o Mercado Livre mostra
  const antigo = [ex.precoAntigo, produto.precoAntigo].find((v) => v && preco && v > preco) ?? null;
  const off = desconto(preco, antigo);
  const titulo = produto.titulo || ex.titulo || "Oferta no Mercado Livre";
  // "chamada": a primeira linha de quem postou, quando não é o próprio nome do produto
  const chamada = mensagem
    .split(/\r?\n/)
    .map((l) => l.replace(/[*_~`]/g, "").trim())
    .find((l) => l.length >= 6) ?? "";
  const usaChamada =
    chamada && !/https?:|R\$|cupom/i.test(chamada) && !semelhante(chamada, titulo);
  const texto = montar(cfg.template || TEMPLATE_PADRAO, {
    chamada: usaChamada ? chamada : "",
    titulo,
    preco: preco ? brl(preco) : "",
    preco_antigo: antigo ? brl(antigo) : "",
    desconto: off ? `${off}%` : "",
    economia: off && antigo && preco ? brl(antigo - preco) : "",
    pix: /\bpix\b/i.test(mensagem) ? "1" : "",
    loja_oficial: /loja oficial/i.test(mensagem) ? "1" : "",
    cupom: ex.cupom ?? "",
    link: linkCurto(link),
    loja: "Mercado Livre",
    fechamento: FECHAMENTOS[Math.floor(Math.random() * FECHAMENTOS.length)],
  });
  return { ok: true, texto, linkOriginal: links[0], linkAfiliado: link, imagem: produto.imagem };
}

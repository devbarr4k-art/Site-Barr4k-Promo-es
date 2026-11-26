// Tira de uma mensagem de oferta: links, cupom, preços e título.

export type Extraido = {
  links: string[];
  cupom: string | null;
  preco: number | null;
  precoAntigo: number | null;
  titulo: string;
};

const RE_LINK = /https?:\/\/[^\s<>"')\]]+/gi;
const RE_CUPOM = /\b(?:cupom|cupon|c[oó]digo|code)(?:\s+de\s+desconto)?\s*[:\-–]?\s*[*_`"'“]?([A-Z0-9][A-Z0-9_-]{2,24})[*_`"'”]?/i;
const RE_PRECO = /R\$\s*([\d.]{1,9}(?:,\d{2})?)/gi;
const PALAVRAS_DE = /\b(de|era|antes|por apenas de)\s*:?\s*$/i;

export function paraNumero(br: string): number {
  return Number(br.replace(/\./g, "").replace(",", "."));
}

export function extrair(texto: string): Extraido {
  const links = [...new Set((texto.match(RE_LINK) ?? []).map((l) => l.replace(/[.,;!?)*_]+$/, "")))];

  const cupomBruto = texto.match(RE_CUPOM)?.[1] ?? null;
  // "cupom de desconto", "cupom na página" etc. não são códigos
  const cupom =
    cupomBruto && (/\d/.test(cupomBruto) || (cupomBruto === cupomBruto.toUpperCase() && cupomBruto.length >= 4))
      ? cupomBruto
      : null;

  // preços: o menor costuma ser o "por", o maior o "de"; "De R$ X" marca o antigo
  const precos: { valor: number; antigo: boolean }[] = [];
  for (const m of texto.matchAll(RE_PRECO)) {
    const antes = texto.slice(Math.max(0, (m.index ?? 0) - 14), m.index);
    const riscado = /~$/.test(antes.trimEnd());
    precos.push({ valor: paraNumero(m[1]), antigo: PALAVRAS_DE.test(antes) || riscado });
  }
  const validos = precos.filter((p) => p.valor > 0 && p.valor < 1_000_000);
  let preco: number | null = null;
  let precoAntigo: number | null = null;
  const marcado = validos.find((p) => p.antigo);
  if (marcado) {
    precoAntigo = marcado.valor;
    preco = validos.filter((p) => !p.antigo).map((p) => p.valor).sort((a, b) => a - b)[0] ?? null;
  } else if (validos.length >= 2) {
    const ord = [...validos].map((p) => p.valor).sort((a, b) => a - b);
    preco = ord[0];
    precoAntigo = ord[ord.length - 1] > ord[0] ? ord[ord.length - 1] : null;
  } else if (validos.length === 1) {
    preco = validos[0].valor;
  }

  // título: primeira linha "de texto" (sem link, sem preço, sem só emoji)
  const titulo =
    texto
      .split(/\r?\n/)
      .map((l) => l.replace(/[*_~`]/g, "").replace(/^[^\p{L}\p{N}]+/u, "").trim())
      .find(
        (l) =>
          l.length >= 6 &&
          !RE_LINK.test(l) &&
          !/R\$/.test(l) &&
          !/^\W+$/u.test(l) &&
          !RE_CUPOM.test(l) &&
          /[a-zà-ú]{3}/i.test(l),
      ) ?? "";
  RE_LINK.lastIndex = 0;

  return { links, cupom, preco, precoAntigo, titulo };
}

export function desconto(preco: number | null, antigo: number | null) {
  if (!preco || !antigo || antigo <= preco) return null;
  return Math.round((1 - preco / antigo) * 100);
}

export const brl = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2 }).replace(/\s/g, " ");

// Chamada própria da ACHOU pro topo do post (não copia a frase do canal de origem).
// Monta a partir dos dados da oferta: desconto, preço, cupom, Pix e nome curto do produto.

const sorteia = <T,>(xs: T[]) => xs[Math.floor(Math.random() * xs.length)];
const real = (n: number) => `R$ ${n.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`;

/** "Kit 10 Cuecas Boxer Lupo Algodão..." → "Kit 10 Cuecas Boxer Lupo" */
export function nomeCurto(titulo: string) {
  const limpo = titulo.replace(/\s*[-|,(].*$/, "").replace(/\s+/g, " ").trim();
  const palavras = limpo.split(" ");
  let nome = "";
  for (const p of palavras) {
    if ((nome + " " + p).trim().length > 28) break;
    nome = (nome + " " + p).trim();
  }
  return nome || palavras.slice(0, 3).join(" ");
}

/** Próximo valor "redondo" acima do preço (R$ 9,90 → 10; R$ 87 → 90; R$ 341 → 350; R$ 2.465 → 2.500). */
function teto(preco: number) {
  const passo = preco < 20 ? 5 : preco < 100 ? 10 : preco < 500 ? 50 : preco < 2000 ? 100 : 500;
  const t = Math.ceil((preco + 0.01) / passo) * passo;
  return t - preco <= passo * 0.6 ? t : null;
}

export function criarChamada(d: { titulo: string; preco: number | null; desconto: number | null; cupom: string | null; pix: boolean }) {
  const nome = nomeCurto(d.titulo);
  const NOME = nome.toUpperCase();
  const opcoes: string[] = [];

  if (d.desconto && d.desconto >= 15) {
    opcoes.push(
      `🚨 ${d.desconto}% OFF NO ${NOME}`,
      `💥 DESABOU: ${NOME} COM ${d.desconto}% DE DESCONTO`,
      `${d.desconto}% MAIS BARATO, CORRE!`,
      `📉 CAIU ${d.desconto}%: ${NOME}`,
    );
  }
  if (d.desconto && d.desconto >= 40) opcoes.push(`🤯 QUASE METADE DO PREÇO: ${NOME}`, `🔥 PREÇO DE BLACK NO ${NOME}`);
  if (d.preco) {
    const t = teto(d.preco);
    if (t) opcoes.push(`💸 ${NOME} POR MENOS DE ${real(t)}`, `MENOS DE ${real(t)} NESSE ${NOME}`);
    if (d.pix) opcoes.push(`⚡ NO PIX SAI POR ${real(Math.floor(d.preco))} E POUCO`);
  }
  if (d.cupom) opcoes.push(`🎟️ CUPOM LIBERADO PRO ${NOME}`, `🎟️ COM CUPOM FICA MAIS BARATO: ${NOME}`);
  opcoes.push(`👀 OLHA ESSE PREÇO NO ${NOME}`, `🛒 ACHAMOS: ${NOME} EM OFERTA`, `✅ BOA OPORTUNIDADE: ${NOME}`);

  return sorteia(opcoes);
}

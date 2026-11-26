// Tudo que o Barr4k pode querer trocar fica aqui.
export const LINKS = {
  telegram: "https://t.me/", // TODO: link real do grupo
  whatsapp: "https://chat.whatsapp.com/", // TODO: link real da comunidade
  instagram: "#",
  tiktok: "#",
};

// TODO: confirmar números reais com o Barr4k antes de publicar
export const NUMEROS = {
  membros: "+500 mil",
  ofertasMes: "1.280",
};

export type Oferta = {
  id: string;
  nome: string;
  loja: string;
  de: number;
  por: number;
  img: string;
  w: number;
  h: number;
};

// Recortes vindos do canvas de marca (ACHOU — Brand Guidelines). Trocar pelas fotos das ofertas reais.
export const OFERTAS: Oferta[] = [
  { id: "console", nome: "Console portátil 64 GB", loja: "Loja parceira", de: 2399, por: 1799, img: "/produtos/console-v3.webp", w: 1800, h: 882 },
  { id: "fone", nome: "Headphone Bluetooth ANC", loja: "Loja parceira", de: 419.9, por: 269.9, img: "/produtos/headphone-v2.webp", w: 300, h: 338 },
  { id: "purificador", nome: "Purificador de água gelada", loja: "Loja parceira", de: 1299, por: 899, img: "/produtos/purificador-v1.webp", w: 705, h: 872 },
  { id: "geladeira", nome: "Geladeira Frost Free 2 portas", loja: "Loja parceira", de: 3899, por: 2799, img: "/produtos/geladeira-v1.webp", w: 247, h: 598 },
  { id: "teclado", nome: "Teclado mecânico 75%", loja: "Loja parceira", de: 549, por: 389, img: "/produtos/teclado-v2.webp", w: 618, h: 375 },
  { id: "earbuds", nome: "Fone sem fio TWS", loja: "Loja parceira", de: 199, por: 123, img: "/produtos/earbuds-v3.webp", w: 352, h: 559 },
];

// Mostra centavos só quando o preço tem (R$ 269,90 / R$ 1.799)
// Produto da animação "uma oferta, do começo ao fim"
export const DESTAQUE: Oferta = {
  id: "ps5",
  nome: "PlayStation 5 Digital",
  loja: "Loja parceira",
  de: 3999,
  por: 3199,
  img: "/produtos/ps5-v1.webp",
  w: 474,
  h: 660,
};

export const brl = (n: number) =>
  n.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: Number.isInteger(n) ? 0 : 2,
    maximumFractionDigits: Number.isInteger(n) ? 0 : 2,
  });

export const desconto = (o: Pick<Oferta, "de" | "por">) => Math.round((1 - o.por / o.de) * 100);

// Membros do grupo: nick, fala e foto enviados por eles (26/11/2026). Fala sem edição.
export type Depoimento = {
  nome: string;
  cidade?: string;
  produto: string;
  texto: string;
  avatar: string;
  foto?: string;
  foco?: string;
  economia?: number;
};

export const DEPOIMENTOS: Depoimento[] = [
  { nome: "JkZzz", cidade: "São Paulo, SP", produto: "Monitor Alienware 27”", texto: "peguei esse 320hz por preço de 144 kkkkkkk até agora não acredito que deu bom, chegou no dia seguinte aqui em SP, alerta salvou", avatar: "/depoimentos/av-jkzzz.webp", foto: "/depoimentos/unbox-lucas.webp", economia: 600 },
  { nome: "Vitória R.", cidade: "Belo Horizonte, MG", produto: "iPhone", texto: "Mesmo sendo a ACHOU ainda desconfiei do preço por estar tão bom, mas chegou lacrado e com garantia do mercado livre aqui em BH! ainda bem que ativei as notis do grupo", avatar: "/depoimentos/av-vitoria.webp", foto: "/depoimentos/unbox-vitoria.webp", foco: "50% 45%", economia: 250 },
  { nome: "Lipezera", cidade: "Lavras, MG", produto: "SSD Kingston NV3", texto: "Peguei no cupom aqui do grupo, slk tava na hora de dar um upgrade ná máquina! saiu bem mais barato que na KabuM, já instalei e o PC tá voando", avatar: "/depoimentos/av-lipezera.webp", foto: "/depoimentos/unbox-luiz.webp", foco: "50% 74%", economia: 350 },
  { nome: "Vitinho", cidade: "Jundiaí, SP", produto: "Smart TV TCL", texto: "Melhor compra do ano! enrolei pra comprar mas bastaram 2 dias no grupo que saiu o alerta da promoção e não tiver como perder, cheguei a economizar quase 600 reais com o link eu acho.", avatar: "/depoimentos/av-vitinho.webp", foto: "/depoimentos/unbox-leandro.webp", economia: 580 },
  { nome: "Rafaella V.", cidade: "Três Pontas, MG", produto: "Smartwatch", texto: "Comprei na oferta relâmpago do grupo e deu super certo!! Chegou rápido aqui em minas, super leve pra academia e já mandei um treino de 5km com ele haha, metade do preço das lojas físicas", avatar: "/depoimentos/av-smartwatch.webp", foto: "/depoimentos/unbox-rafaella.webp", foco: "50% 62%", economia: 300 },
  { nome: "Carol Y.", cidade: "Alfenas, MG", produto: "Geladeira Frost Free", texto: "Finalmente terminei a cozinha aqui de casa, não sei como vim parar no grupo mas salvou muito e com certeza não saio mais!", avatar: "/depoimentos/av-geladeira.webp", foto: "/depoimentos/unbox-carol.webp", foco: "50% 22%", economia: 500 },
  { nome: "André M.", cidade: "Campinas, SP", produto: "Headset H3 Pro", texto: "Paguei preço de fone básico nesse modelo com cancelamento de ruído graças à promo postada aqui. Isola tudo e a bateria dura muito, valeu demais!", avatar: "/depoimentos/av-headset.webp", foto: "/depoimentos/unbox-andre.webp", foco: "50% 30%", economia: 200 },
  { nome: "jujubs", cidade: "Ouro Preto, MG", produto: "Fone Occiam P91", texto: "Baratinho demais pelo que entrega! Peguei no link do meli aqui do grupo, encaixa certinho no ouvido e tem um grave muito bom. mandei no grupo da família pra entrarem também!", avatar: "/depoimentos/av-jujubs.webp", foto: "/depoimentos/unbox-julia.webp", economia: 60 },
];

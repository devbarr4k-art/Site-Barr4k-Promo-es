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

export const OFERTAS: Oferta[] = [
  { id: "console", nome: "Console portátil 8 GB", loja: "Loja parceira", de: 2499, por: 1549, img: "/produtos/console.webp", w: 635, h: 411 },
  { id: "fone", nome: "Fone com cancelamento de ruído", loja: "Loja parceira", de: 799, por: 569, img: "/produtos/fone.webp", w: 417, h: 495 },
  { id: "ssd", nome: "SSD NVMe 2 TB", loja: "Loja parceira", de: 1299, por: 589, img: "/produtos/ssd.webp", w: 518, h: 403 },
  { id: "teclado", nome: "Teclado mecânico sem fio", loja: "Loja parceira", de: 899, por: 489, img: "/produtos/teclado.webp", w: 480, h: 174 },
  { id: "earbuds", nome: "Fone in-ear Bluetooth", loja: "Loja parceira", de: 349, por: 179, img: "/produtos/earbuds.webp", w: 236, h: 328 },
];

export const brl = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

export const desconto = (o: Pick<Oferta, "de" | "por">) => Math.round((1 - o.por / o.de) * 100);

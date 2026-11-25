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
  { id: "fone", nome: "Headphone Bluetooth ANC", loja: "Loja parceira", de: 799, por: 569, img: "/produtos/headphone-v2.webp", w: 300, h: 338 },
  { id: "ssd", nome: "SSD NVMe 1 TB", loja: "Loja parceira", de: 499, por: 299, img: "/produtos/ssd-v2.webp", w: 599, h: 539 },
  { id: "teclado", nome: "Teclado mecânico 75%", loja: "Loja parceira", de: 549, por: 389, img: "/produtos/teclado-v2.webp", w: 618, h: 375 },
  { id: "earbuds", nome: "Fone sem fio TWS", loja: "Loja parceira", de: 199, por: 123, img: "/produtos/earbuds-v2.webp", w: 287, h: 301 },
];

export const brl = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

export const desconto = (o: Pick<Oferta, "de" | "por">) => Math.round((1 - o.por / o.de) * 100);

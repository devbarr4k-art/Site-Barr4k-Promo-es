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
  { id: "earbuds", nome: "Fone sem fio TWS", loja: "Loja parceira", de: 199, por: 123, img: "/produtos/earbuds-v3.webp", w: 352, h: 559 },
];

export const brl = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

export const desconto = (o: Pick<Oferta, "de" | "por">) => Math.round((1 - o.por / o.de) * 100);

// ⚠️ EXEMPLOS escritos para o layout. Trocar por depoimentos REAIS de membros do grupo
// (com autorização) antes de publicar — depoimento inventado é propaganda enganosa (CDC art. 37).
// foto: foto que a pessoa mandou do produto (em /public/depoimentos/). Sem foto, o card mostra só o texto.
export type Depoimento = { nome: string; cidade: string; produto: string; texto: string; economia: number; nota?: number; foto?: string };

export const DEPOIMENTOS: Depoimento[] = [
  { nome: "Lucas M.", cidade: "São Paulo, SP", produto: "Monitor Alienware 27”", texto: "Monitor chegou hoje, lacrado e com nota. Paguei bem menos do que tava semana passada. Valeu demais!", economia: 1100 },
  { nome: "Ana Paula", cidade: "Belo Horizonte, MG", produto: "iPhone 15 128 GB", texto: "Peguei o iPhone no bug de preço que vocês mandaram às 7h. Às 7h20 já tinha acabado.", economia: 1350 },
  { nome: "Rodrigo S.", cidade: "Curitiba, PR", produto: "Geladeira Frost Free 480 L", texto: "Geladeira nova em casa. Minha esposa achou que era golpe até o caminhão chegar kkkk", economia: 900 },
  { nome: "Camila R.", cidade: "Recife, PE", produto: "Air fryer 5 L", texto: "O cupom de vocês funcionou de primeira. Nos outros grupos o cupom nunca pega.", economia: 180, nota: 4 },
  { nome: "Thiago L.", cidade: "Porto Alegre, RS", produto: "PS5 Slim", texto: "Achei que nunca ia ver o PS5 nesse preço. Chegou em 3 dias, tudo certinho.", economia: 750 },
  { nome: "Juliana F.", cidade: "Rio de Janeiro, RJ", produto: "Notebook i7 16 GB", texto: "Tava esperando cair faz meses. Deixei a notificação ligada e no dia que caiu eu vi primeiro.", economia: 1200 },
  { nome: "Felipe A.", cidade: "Goiânia, GO", produto: "SSD NVMe 1 TB", texto: "Montei meu PC quase todo com oferta daqui. SSD, fonte e gabinete.", economia: 420, foto: "/produtos/ssd-v2.webp" },
  { nome: "Bruna C.", cidade: "Florianópolis, SC", produto: "Smartwatch", texto: "Comprei de presente pro meu namorado e ainda sobrou pro jantar.", economia: 260, nota: 4 },
  { nome: "Marcos V.", cidade: "Salvador, BA", produto: "Smart TV 55” 4K", texto: "TV 55 por menos do que paguei na minha de 43 há dois anos. Surreal.", economia: 980 },
  { nome: "Pedro H.", cidade: "Brasília, DF", produto: "Headphone ANC", texto: "Silenciei todos os outros grupos de promoção. Só deixei a ACHOU ligada.", economia: 230, foto: "/produtos/headphone-v2.webp" },
];

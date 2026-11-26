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

// Membros do grupo que autorizaram o uso do nome. Só entra aqui o que é real:
// nome, foto e o produto que a pessoa comprou. "texto" só com a fala de verdade da pessoa.
// foto: foto de unboxing que a própria pessoa mandou (public/depoimentos)
export type Depoimento = { nome: string; cidade: string; produto: string; texto?: string; foto?: string; foco?: string; economia?: number };

export const DEPOIMENTOS: Depoimento[] = [
  { nome: "Luiz P.", cidade: "Lavras, MG", produto: "SSD Kingston NV3", texto: "Peguei no cupom que mandaram aqui no grupo e saiu muito abaixo do preço normal! Chegou certinho em Lavras, já instalei e o PC tá voando. Economia absurda.", foto: "/depoimentos/unbox-luiz.webp", foco: "50% 74%", economia: 350 },
  { nome: "Rafaella V.", cidade: "Três Pontas, MG", produto: "Smartwatch", texto: "Comprei na oferta relâmpago que soltaram aqui e não me arrependo. Chegou rapidinho em Três Pontas, super leve pro treino e saiu pela metade do preço das lojas físicas.", foto: "/depoimentos/unbox-rafaella.webp", foco: "50% 62%", economia: 300 },
  { nome: "Lucas B.", cidade: "São Paulo, SP", produto: "Monitor Alienware 27”", texto: "Tava namorando esse monitor há meses e só consegui pegar por causa do alerta daqui. Chegou no dia seguinte em SP, zero dead pixel e preço imbatível.", foto: "/depoimentos/unbox-lucas.webp", economia: 600 },
  { nome: "Vitória R.", cidade: "Belo Horizonte, MG", produto: "iPhone", texto: "Confesso que fiquei com medo pelo preço estar tão bom, mas chegou lacrado e original aqui em BH! Ainda bem que ativei as notificações do grupo a tempo.", foto: "/depoimentos/unbox-vitoria.webp", foco: "50% 45%", economia: 250 },
  { nome: "Leandro M.", cidade: "Jundiaí, SP", produto: "Smart TV TCL", texto: "Melhor compra que fiz no ano! Economizei quase 600 reais com o link do grupo. A imagem é absurda de boa e chegou bem antes do prazo aqui em Jundiaí.", foto: "/depoimentos/unbox-leandro.webp", economia: 400 },
  { nome: "Carol Y.", cidade: "Alfenas, MG", produto: "Geladeira Frost Free", texto: "Consegui fechar no menor preço histórico que vocês avisaram! Veio impecável, super silenciosa e a entrega em Alfenas foi super tranquila.", foto: "/depoimentos/unbox-carol.webp", foco: "50% 22%", economia: 500 },
  { nome: "André M.", cidade: "Campinas, SP", produto: "Headset H3 Pro", texto: "Paguei preço de fone básico nesse modelo com cancelamento de ruído graças à promo postada aqui. Isola tudo e a bateria dura muito, valeu demais!", foto: "/depoimentos/unbox-andre.webp", foco: "50% 30%", economia: 200 },
  { nome: "Julia M.", cidade: "Ouro Preto, MG", produto: "Fone Occiam P91", texto: "Baratinho demais pelo que entrega! Peguei no link promocional, encaixa super bem no ouvido e tem um grave muito bom. Já indiquei o grupo pros meus amigos.", foto: "/depoimentos/unbox-julia.webp", economia: 60 },
];

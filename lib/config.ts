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

// Membros do grupo que autorizaram o uso da foto e do nome. Só entra aqui o que é real:
// nome, foto e o produto que a pessoa comprou. "texto" só com a fala de verdade da pessoa.
export type Depoimento = { nome: string; cidade: string; produto: string; avatar: string; texto?: string };

export const DEPOIMENTOS: Depoimento[] = [
  { nome: "Luiz P.", cidade: "Lavras, MG", produto: "SSD NVMe 1 TB", avatar: "/depoimentos/pessoa-02.webp", texto: "Peguei no cupom que mandaram aqui no grupo e saiu muito abaixo do preço normal! Chegou certinho em Lavras, já instalei e o PC tá voando. Economia absurda." },
  { nome: "Rafaella V.", cidade: "Três Pontas, MG", produto: "Smartwatch", avatar: "/depoimentos/pessoa-01.webp", texto: "Comprei na oferta relâmpago que soltaram aqui e não me arrependo. Chegou rapidinho em Três Pontas, super leve pro treino e saiu pela metade do preço das lojas físicas." },
  { nome: "Lucas B.", cidade: "São Paulo, SP", produto: "Monitor Alienware 27”", avatar: "/depoimentos/pessoa-04.webp", texto: "Tava namorando esse monitor há meses e só consegui pegar por causa do alerta daqui. Chegou no dia seguinte em SP, zero dead pixel e preço imbatível." },
  { nome: "Vitória R.", cidade: "Belo Horizonte, MG", produto: "iPhone 15 128 GB", avatar: "/depoimentos/pessoa-03.webp", texto: "Confesso que fiquei com medo pelo preço estar tão bom, mas chegou lacrado e original aqui em BH! Ainda bem que ativei as notificações do grupo a tempo." },
  { nome: "Leandro M.", cidade: "Jundiaí, SP", produto: "Smart TV 55” 4K", avatar: "/depoimentos/pessoa-06.webp", texto: "Melhor compra que fiz no ano! Economizei quase 600 reais com o link do grupo. A imagem é absurda de boa e chegou bem antes do prazo aqui em Jundiaí." },
  { nome: "Carol Y.", cidade: "Alfenas, MG", produto: "Geladeira Frost Free", avatar: "/depoimentos/pessoa-05.webp", texto: "Consegui fechar no menor preço histórico que vocês avisaram! Veio impecável, super silenciosa e a entrega em Alfenas foi super tranquila." },
  { nome: "André M.", cidade: "Campinas, SP", produto: "Headphone ANC", avatar: "/depoimentos/pessoa-07.webp", texto: "Paguei preço de fone básico nesse modelo com cancelamento de ruído graças à promo postada aqui. Isola tudo e a bateria dura muito, valeu demais!" },
  { nome: "Julia M.", cidade: "Ouro Preto, MG", produto: "Fone sem fio TWS", avatar: "/depoimentos/pessoa-08.webp", texto: "Baratinho demais pelo que entrega! Peguei no link promocional, encaixa super bem no ouvido e tem um grave muito bom. Já indiquei o grupo pros meus amigos." },
];

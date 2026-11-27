import Image from "next/image";
import { Bolt, Logo } from "@/components/Logo";
import { Motion } from "@/components/Motion";
import { PhoneFeed } from "@/components/PhoneFeed";
import { IndexList } from "@/components/IndexList";
import { GateLink, LeadModal } from "@/components/LeadGate";
import { Rastreio } from "@/components/Rastreio";
import { Particles } from "@/components/Particles";
import { Check, Cross, TelegramIcon, WhatsIcon } from "@/components/Icons";
import { DEPOIMENTOS, DESTAQUE, LINKS, OFERTAS, brl, desconto, type Depoimento } from "@/lib/config";

const console8 = DESTAQUE;
const fone = OFERTAS[1];

const SPAM_ZE = [
  { t: "🚨🚨🚨 CORREEEEE PESSOAL", h: "10:41" },
  { t: "FONE BLUETOOTH CANCELAMENTO R$ 349 👉 bit.ly/3xK9q…", h: "10:41", price: true },
  { t: "alguém comprou? o link deu erro aqui", h: "10:43", user: "Marcos" },
  { t: "PROMOÇÃO RELÂMPAGO!!! SÓ HOJE!!! 🔥🔥", h: "10:44" },
  { t: "📢 ENTRE NO NOSSO GRUPO VIP POR R$ 19,90", h: "10:44" },
  { t: "esse preço tava menor semana passada kkkk", h: "10:46", user: "Bia" },
  { t: "CAFETEIRA 🔥 R$ 389 👉 encurta.do/9fa…", h: "10:47" },
];
const SPAM_JU = [
  { t: "Bom diaaa meninas!! 💖💖", h: "10:38" },
  { t: "⚠️ FONE TOP R$ 329 (cupom JU10 não funciona no app)", h: "10:40", price: true },
  { t: "cupom inválido aqui 😭", h: "10:40", user: "Carla" },
  { t: "olha esse sorteio!!! compartilhe com 10 amigos", h: "10:42" },
  { t: "link expirado", h: "10:42", user: "Rafa" },
  { t: "🛍️🛍️ ACHADINHOS DA SHOPEE 🛍️🛍️ 12 links abaixo", h: "10:45" },
  { t: "tem pix?", h: "10:46", user: "Jéssica" },
];

function SpamChat({ nome, membros, msgs }: { nome: string; membros: string; msgs: typeof SPAM_ZE }) {
  const loop = [...msgs, ...msgs];
  return (
    <div className="chat chat--spam">
      <header className="chat__head">
        <span className="chat__avatar">{nome[0]}</span>
        <span>
          <strong>{nome}</strong>
          <small>{membros}</small>
        </span>
        <span className="chat__unread">+99</span>
      </header>
      <div className="chat__window">
        <div className="chat__scroll">
          {loop.map((m, i) => (
            <p key={i} className={`chat__bubble ${m.user ? "is-user" : ""} ${m.price ? "is-price" : ""}`}>
              {m.user && <b>{m.user}</b>}
              {m.t}
              <time>{m.h}</time>
            </p>
          ))}
        </div>
      </div>
      <ul className="chat__verdict">
        <li><Cross /> link quebrado</li>
        <li><Cross /> preço mais alto</li>
        <li><Cross /> 214 mensagens hoje</li>
      </ul>
    </div>
  );
}

// Botão com a animação da BB Agency (ref. kr3w.gg): o círculo cresce e enche a pílula,
// o ícone sai e entra de novo, e o texto rola pra cima já na cor nova.
function Btn({
  canal = "telegram",
  origem,
  icon,
  children,
  variant = "lime",
  size = "lg",
}: {
  canal?: "telegram" | "whatsapp";
  origem: string;
  icon: React.ReactNode;
  children: string;
  variant?: "lime" | "white";
  size?: "lg" | "sm";
}) {
  return (
    <GateLink canal={canal} origem={origem} className={`btn btn--${variant} btn--${size}`}>
      <span className="btn__fill" aria-hidden="true" />
      <span className="btn__ico" aria-hidden="true">
        <span className="btn__ico-a">{icon}</span>
        <span className="btn__ico-b">{icon}</span>
      </span>
      <span className="btn__label">
        <span>{children}</span>
        <span aria-hidden="true">{children}</span>
      </span>
    </GateLink>
  );
}

function CTAButtons({ origem }: { origem: string }) {
  return (
    <div className="ctas">
      <Btn origem={origem} icon={<TelegramIcon size={18} />}>
        Entrar no grupo do Telegram
      </Btn>
      {/* comunidade do WhatsApp ainda não abriu: botão desativado */}
      <span className="btn btn--white btn--lg btn--breve" aria-disabled="true" title="A comunidade no WhatsApp abre em breve">
        <span className="btn__ico" aria-hidden="true">
          <span className="btn__ico-a">
            <WhatsIcon size={18} />
          </span>
        </span>
        <span className="btn__label">
          <span>WhatsApp · em breve</span>
        </span>
      </span>
    </div>
  );
}

function Ticker() {
  const itens = [...OFERTAS, ...OFERTAS];
  return (
    <div className="ticker" aria-label="Ofertas recentes">
      <div className="ticker__track">
        {[0, 1].map((c) => (
          <div key={c} className="ticker__set" aria-hidden={c === 1 ? true : undefined}>
            {itens.map((o, i) => (
              <span key={`${o.id}-${i}`} className="ticker__item">
                <Bolt size={22} />
                <span>{o.nome}</span>
                <s>{brl(o.de)}</s>
                <b>{brl(o.por)}</b>
                <em>-{desconto(o)}%</em>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// Peças que voam na "enxurrada": [tipo, conteúdo, x (vw), y (vh), z inicial (-2200..0), início na timeline, opacidade inicial, fica no final?]
// A 1ª onda já entra visível e espalhada pelo palco (nada de tela preta ou produto solto),
// o spam passa e some pela câmera, e os achados limpos emolduram a frase final.
type PecaTempestade = {
  tipo: "img" | "tag" | "spam";
  c: string;
  x: number;
  y: number;
  z0: number;
  ini: number;
  op0: number;
  fica?: boolean;
};

const TEMPESTADE: PecaTempestade[] = [
  // ── Onda 1: já visível assim que a seção aparece abaixo do letreiro
  { tipo: "img", c: "0", x: -27, y: -14, z0: -380, ini: 0, op0: 1 },
  { tipo: "spam", c: "CORREEEE!!! 🔥", x: 25, y: -22, z0: -460, ini: 0, op0: 0.95 },
  { tipo: "tag", c: "-40%", x: -12, y: 20, z0: -520, ini: 0, op0: 0.9 },
  { tipo: "img", c: "1", x: 28, y: 14, z0: -680, ini: 0, op0: 0.9 },
  { tipo: "spam", c: "GRUPO VIP R$ 19,90", x: -30, y: 18, z0: -820, ini: 0, op0: 0.8 },
  { tipo: "img", c: "4", x: 4, y: -26, z0: -920, ini: 0, op0: 0.78 },
  { tipo: "tag", c: "CUPOM ACHOU15", x: -26, y: -30, z0: -1050, ini: 0, op0: 0.65 },

  // ── Onda 2: enxurrada principal (spam + ofertas cruzam a câmera)
  { tipo: "img", c: "2", x: -22, y: 12, z0: -1450, ini: 0.08, op0: 0 },
  { tipo: "tag", c: "MENOR PREÇO 90D", x: 18, y: -8, z0: -1550, ini: 0.14, op0: 0 },
  { tipo: "spam", c: "link expirado", x: 32, y: -28, z0: -1650, ini: 0.2, op0: 0 },
  { tipo: "img", c: "3", x: 24, y: 24, z0: -1750, ini: 0.26, op0: 0 },
  { tipo: "spam", c: "SÓ HOJE!!! ÚLTIMAS UNIDADES", x: -14, y: -24, z0: -1850, ini: 0.34, op0: 0 },
  { tipo: "tag", c: "FRETE GRÁTIS", x: 32, y: -2, z0: -1950, ini: 0.42, op0: 0 },
  { tipo: "img", c: "5", x: -34, y: -4, z0: -2050, ini: 0.5, op0: 0 },
  { tipo: "spam", c: "bit.ly/3xK9q…", x: 10, y: 28, z0: -2150, ini: 0.58, op0: 0 },
  { tipo: "tag", c: "R$ 269,90", x: -22, y: 28, z0: -2200, ini: 0.66, op0: 0 },
  { tipo: "spam", c: "promoção falsa", x: 20, y: -32, z0: -2250, ini: 0.74, op0: 0 },
  { tipo: "spam", c: "CUPOM INVÁLIDO 😭", x: -32, y: -18, z0: -2300, ini: 0.82, op0: 0 },
  { tipo: "tag", c: "-52%", x: 8, y: -16, z0: -2350, ini: 0.9, op0: 0 },
  { tipo: "spam", c: "FRETE R$ 89,00", x: -6, y: 22, z0: -2400, ini: 0.98, op0: 0 },

  // ── Onda 3: o ruído foi embora; só os achados limpos ficam nas bordas com a frase
  { tipo: "img", c: "ps5", x: -33, y: -18, z0: -2400, ini: 1.05, op0: 0, fica: true },
  { tipo: "img", c: "1", x: 34, y: 18, z0: -2400, ini: 1.12, op0: 0, fica: true },
  { tipo: "tag", c: "PIX -10%", x: 31, y: -22, z0: -2400, ini: 1.18, op0: 0, fica: true },
  { tipo: "tag", c: "CONFERIDO", x: -31, y: 22, z0: -2400, ini: 1.24, op0: 0, fica: true },
];

function Tempestade() {
  return (
    <section className="storm" aria-label="A gente garimpa tudo. Só chega o que vale a pena.">
      <div className="storm__stage">
        <div className="storm__glow" aria-hidden="true" />
        <div className="storm__rings" aria-hidden="true" />
        <div className="storm__space" aria-hidden="true">
          {TEMPESTADE.map((p, i) => {
            const prod = p.tipo === "img" ? (p.c === "ps5" ? console8 : OFERTAS[Number(p.c)]) : null;
            return (
              <div
                key={i}
                className={`storm__item storm__item--${p.tipo}${p.fica ? " is-stay" : ""}`}
                data-z0={p.z0}
                data-ini={p.ini}
                data-op0={p.op0}
                data-stay={p.fica ? "1" : undefined}
                style={{ "--x": p.x, "--y": p.y } as React.CSSProperties}
              >
                {prod ? (
                  <Image src={prod.img} alt="" width={prod.w} height={prod.h} sizes="300px" loading="eager" />
                ) : (
                  <span>{p.c}</span>
                )}
              </div>
            );
          })}
        </div>
        <div className="storm__copy">
          <p className="storm__kicker">
            <span className="storm__dot" aria-hidden="true" />
            1.240 links analisados por dia · só ~38 passam
          </p>
          <h2 className="storm__title">
            <span>A gente garimpa tudo.</span>
            <span className="lime">Só chega o que vale a pena.</span>
          </h2>
        </div>
      </div>
    </section>
  );
}

function CardDepoimento({ d }: { d: Depoimento }) {
  return (
    <figure className="dep dep--membro">
      {d.foto && (
        <div className="dep__unbox">
          <Image src={d.foto} alt={`${d.produto} que ${d.nome.split(" ")[0]} recebeu`} fill sizes="(max-width: 899px) 310px, 400px" style={d.foco ? { objectPosition: d.foco } : undefined} />
        </div>
      )}
      <div className="dep__head">
        <Image className="dep__av-foto" src={d.avatar} alt="" width={104} height={104} sizes="52px" />
        <span className="dep__quem2">
          <b>{d.nome}</b>
          {d.cidade && <span className="dep__comprou">{d.cidade}</span>}
        </span>
      </div>
      {d.texto && <blockquote>“{d.texto}”</blockquote>}
      <div className="dep__pe">
        <span className="dep__produto">Comprou: {d.produto}</span>
        {d.economia ? (
          <span className="dep__eco">
            <small>economizou</small>
            {brl(d.economia)}
          </span>
        ) : null}
      </div>
    </figure>
  );
}

// Nomes/falas/fotos estavam trocados (26/11/2026): só volta com os dados certos de cada pessoa.
const MOSTRAR_DEPOIMENTOS = true;

function Depoimentos() {
  return (
    <section className="deps" aria-labelledby="deps-titulo">
      <div className="deps__head">
        <h2 id="deps-titulo" className="mega">Quem entrou, <span className="lime">comprou.</span></h2>
      </div>
      <div className="deps__row">
        <div className="deps__track">
          {[0, 1].map((c) => (
            <div key={c} className="deps__set" aria-hidden={c === 1 ? true : undefined}>
              {DEPOIMENTOS.map((d) => (
                <CardDepoimento key={d.nome} d={d} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <Motion />
      <LeadModal />
      <Rastreio />
      <div className="grain" aria-hidden="true" />

      <header className="nav">
        <a className="nav__brand" href="#topo" aria-label="ACHOU, voltar ao topo"><Logo size={26} /></a>
        <nav className="nav__links" aria-label="Seções">
          <a href="#como-funciona">Como funciona</a>
          <a href="#comparar">Comparar</a>
          <a href="#ofertas">Ofertas</a>
          <a href="#duvidas">Dúvidas</a>
        </nav>
        <Btn origem="navbar" icon={<TelegramIcon size={14} />} size="sm">
          Entrar
        </Btn>
      </header>

      <main id="topo">
        {/* HERO */}
        <section className="hero">
          <Particles />
          <div className="hero__grid">
            <div className="hero__copy">
              <h1 className="hero__title">
                <span className="hero__line"><span>A gente acha,</span></span>
                <span className="hero__line"><span>Você <span className="hl">economiza</span><span className="lime">.</span></span></span>
              </h1>
              <p className="hero__sub">
                Enquanto os outros grupos jogam qualquer link, a ACHOU confere o preço, o cupom e a
                loja antes de mandar pro seu celular.
              </p>
              <CTAButtons origem="topo" />
              <p className="hero__promise">
                Grátis, sem spam, e você sai quando quiser.
              </p>
            </div>

            <div className="hero__phone">
              <PhoneFeed />
            </div>
          </div>

          {/* invisível (CSS): só segura o espaço, o layout fica igual ao de antes */}
          <div className="hero__word" aria-hidden="true">
            <span>ACHOU</span>
          </div>
        </section>

        <Ticker />

        <Tempestade />

        {/* A HISTÓRIA DE UMA OFERTA */}
        <section className="drop" id="como-funciona" data-from={console8.de} data-to={console8.por}>
          <div className="drop__stage">
            <div className="drop__glow" aria-hidden="true" />
            <div className="drop__intro">
              <h2>Uma oferta, do começo ao fim.</h2>
              <p>Role a página e veja o que acontece numa terça-feira comum.</p>
            </div>

            <div className="drop__visual">
              <div className="drop__product">
                <Image src={console8.img} alt={console8.nome} width={console8.w} height={console8.h} sizes="(max-width: 900px) 90vw, 620px" quality={95} priority />
                <span className="drop__badge">-{desconto(console8)}%</span>
              </div>
              <div className="drop__pricebox">
                <p className="drop__name">{console8.nome}</p>
                <p className="drop__was">
                  <span>{brl(console8.de)}</span>
                  <span className="drop__strike" />
                </p>
                <p className="drop__price">{brl(console8.de)}</p>
              </div>
            </div>

            <ol className="drop__steps">
              <li className="drop__step">
                <time>09:14</time>
                <p>O preço cai numa loja parceira. Nosso robô percebe na hora.</p>
              </li>
              <li className="drop__step">
                <time>09:16</time>
                <p>Alguém do time confere histórico de preço, frete, vendedor e cupom.</p>
              </li>
              <li className="drop__step">
                <time>09:17</time>
                <p>A oferta chega no seu Telegram e no WhatsApp, com o link certo.</p>
              </li>
              <li className="drop__step">
                <time>09:31</time>
                <p>Esgotou. Quem estava no grupo pagou {brl(console8.de - console8.por)} a menos.</p>
              </li>
            </ol>
          </div>
        </section>

        {/* COMPARAÇÃO */}
        <section className="compare" id="comparar">
          <h2 className="mega">
            O mesmo fone,
            <br />
            Três grupos.
          </h2>

          <div className="compare__grid">
            <SpamChat nome="Ofertas do Zé" membros="grupo · 4.812 membros" msgs={SPAM_ZE} />

            <div className="chat chat--achou">
              <header className="chat__head">
                <span className="chat__avatar chat__avatar--achou"><Bolt size={40} round /></span>
                <span>
                  <strong>ACHOU Ofertas</strong>
                  <small>canal · 9 ofertas hoje</small>
                </span>
              </header>
              <div className="chat__window chat__window--calm">
                <article className="chat__deal">
                  <div className="chat__dealimg">
                    <Image src={fone.img} alt={fone.nome} width={fone.w} height={fone.h} sizes="200px" />
                    <span className="chat__badge">-{desconto(fone)}%</span>
                  </div>
                  <p className="chat__dealname">{fone.nome}</p>
                  <p className="chat__dealprice">
                    <s>{brl(fone.de)}</s>
                    <strong>{brl(fone.por)}</strong>
                  </p>
                  <p className="chat__note">Menor preço dos últimos 90 dias · conferido às 10:47</p>
                  <GateLink origem="comparacao" className="btn btn--lime btn--block">Ver oferta</GateLink>
                </article>
              </div>
              <ul className="chat__verdict chat__verdict--good">
                <li><Check /> link conferido</li>
                <li><Check /> menor preço</li>
                <li><Check /> 9 mensagens hoje</li>
              </ul>
            </div>

            <SpamChat nome="Promoções da Ju" membros="grupo · 2.390 membros" msgs={SPAM_JU} />
          </div>
          <p className="compare__foot">O mesmo produto. A diferença é quem filtrou.</p>
        </section>

        {/* ÍNDICE DE ACHADOS */}
        <section className="index" id="ofertas">
          <div className="index__head">
            <h2 className="mega">Achados da semana</h2>
          </div>
          <IndexList />
        </section>

        {/* Depoimentos fora do ar até chegarem nomes, falas e fotos corretos */}
        {MOSTRAR_DEPOIMENTOS && <Depoimentos />}

        {/* NÚMEROS */}
        <section className="stats" aria-label="A ACHOU em números">
          <div className="stat">
            <p className="stat__num">
              <span className="count" data-from="0" data-to="38">38</span>
              <span className="stat__of">
                /<span className="count" data-from="0" data-to="1240">1.240</span>
              </span>
            </p>
            <h3>Só o que vale a pena</h3>
            <p>Promoções que passaram no filtro hoje, de 1.240 analisadas. Se não é o menor preço dos últimos meses, não entra.</p>
          </div>
          <div className="stat">
            <p className="stat__num">
              <span className="count" data-from="0" data-to="100">100</span>
              <span className="stat__of">%</span>
            </p>
            <h3>Conferida 1 por 1</h3>
            <p>A gente garimpa vários grupos e lojas e confere cada oferta — preço e cupom — antes de soltar. Você recebe só as melhores.</p>
          </div>
          <div className="stat">
            <p className="stat__num">
              R$&nbsp;<span className="count" data-from="19.9" data-to="0" data-dec="2">0</span>
            </p>
            <h3>De graça, sempre</h3>
            <p>Sem grupo VIP. A ACHOU ganha uma comissão das lojas e o preço pra você não muda.</p>
          </div>
        </section>

        {/* DÚVIDAS */}
        <section className="faq" id="duvidas">
          <h2 className="mega">Dúvidas</h2>
          <div className="faq__list">
            <details>
              <summary>Precisa pagar alguma coisa?</summary>
              <p>Não. Os grupos são gratuitos e vão continuar assim.</p>
            </details>
            <details>
              <summary>Como a ACHOU ganha dinheiro?</summary>
              <p>Usamos links de afiliado. Quando você compra por um link nosso, a loja paga uma comissão para a ACHOU. O preço que você paga é exatamente o mesmo.</p>
            </details>
            <details>
              <summary>Telegram ou WhatsApp, qual escolher?</summary>
              <p>As ofertas são as mesmas nos dois. No Telegram elas chegam alguns segundos antes e dá pra pesquisar ofertas antigas. No WhatsApp é mais prático pra quem não usa Telegram.</p>
            </details>
            <details>
              <summary>Vou receber mensagem demais?</summary>
              <p>Não. Só o que vale a pena nos horários em que as lojas mais baixam preço. Ninguém do grupo pode mandar mensagem, então não tem conversa paralela.</p>
            </details>
            <details>
              <summary>Vocês vendem os produtos?</summary>
              <p>Não. A compra é feita direto na loja, com a garantia e a política de troca dela.</p>
            </details>
          </div>
        </section>

        {/* CTA FINAL */}
        <section className="final">
          <div className="final__glow" aria-hidden="true" />
          <h2 className="final__title">
            <span>A próxima oferta</span>
            <span>já está a caminho.</span>
          </h2>
          <CTAButtons origem="final" />
        </section>
      </main>

      <footer className="foot">
        <div className="foot__row">
          <div className="foot__brand">
            <Logo size={22} />
            <p>A gente acha. Você economiza.</p>
          </div>
          <nav className="foot__links" aria-label="Rodapé">
            <a href="/termos">Termos de uso</a>
            <a href="/privacidade">Privacidade</a>
            <a href={LINKS.telegram} target="_blank" rel="noopener">Telegram</a>
          </nav>
        </div>
        <div className="foot__row foot__row--legal">
          <p>
            A ACHOU participa de programas de afiliados de lojas parceiras. Preços e estoque podem
            mudar a qualquer momento. Imagens meramente ilustrativas.
          </p>
          <p>© 2026 ACHOU · achou.io</p>
        </div>
      </footer>
    </>
  );
}

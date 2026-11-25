import { Bolt, Logo } from "@/components/Logo";
import { Motion } from "@/components/Motion";
import { PhoneFeed } from "@/components/PhoneFeed";
import Image from "next/image";
import { Check, Cross, TelegramIcon, WhatsIcon } from "@/components/Icons";
import { LINKS, NUMEROS, OFERTAS, brl, desconto } from "@/lib/config";

const console8 = OFERTAS[0];
const fone = OFERTAS[1];

const SPAM_ZE = [
  { t: "🚨🚨🚨 CORREEEEE PESSOAL", h: "10:41" },
  { t: "FONE BLUETOOTH CANCELAMENTO R$ 749 👉 bit.ly/3xK9q…", h: "10:41", price: true },
  { t: "alguém comprou? o link deu erro aqui", h: "10:43", user: "Marcos" },
  { t: "PROMOÇÃO RELÂMPAGO!!! SÓ HOJE!!! 🔥🔥", h: "10:44" },
  { t: "📢 ENTRE NO NOSSO GRUPO VIP POR R$ 19,90", h: "10:44" },
  { t: "esse preço tava menor semana passada kkkk", h: "10:46", user: "Bia" },
  { t: "CAFETEIRA 🔥 R$ 389 👉 encurta.do/9fa…", h: "10:47" },
];
const SPAM_JU = [
  { t: "Bom diaaa meninas!! 💖💖", h: "10:38" },
  { t: "⚠️ FONE TOP R$ 719 (cupom JU10 não funciona no app)", h: "10:40", price: true },
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

function CTAButtons({ size = "lg" }: { size?: "lg" | "md" }) {
  return (
    <div className={`ctas ctas--${size}`}>
      <a className="btn btn--lime" href={LINKS.telegram} target="_blank" rel="noopener">
        <TelegramIcon /> Entrar no grupo do Telegram
      </a>
      <a className="btn btn--white" href={LINKS.whatsapp} target="_blank" rel="noopener">
        <WhatsIcon /> Comunidade no WhatsApp
      </a>
    </div>
  );
}

export default function Home() {
  return (
    <>
      <Motion />
      <div className="grain" aria-hidden="true" />

      <header className="nav">
        <a href="#topo" aria-label="ACHOU, voltar ao topo"><Logo size={22} /></a>
        <nav className="nav__links" aria-label="Seções">
          <a href="#como-funciona">Como funciona</a>
          <a href="#comparar">Comparar</a>
          <a href="#ofertas">Ofertas</a>
          <a href="#duvidas">Dúvidas</a>
        </nav>
        <a className="btn btn--lime btn--sm" href={LINKS.telegram} target="_blank" rel="noopener">
          <TelegramIcon size={16} /> Entrar
        </a>
      </header>

      <main id="topo">
        {/* HERO */}
        <section className="hero">
          <div className="hero__glow" aria-hidden="true" />
          <svg className="hero__streaks" viewBox="0 0 1440 900" preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <linearGradient id="st" x1="0" x2="1">
                <stop offset="0" stopColor="#C6FF00" stopOpacity="0" />
                <stop offset=".6" stopColor="#C6FF00" stopOpacity=".55" />
                <stop offset="1" stopColor="#C6FF00" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d="M-40 760 L1480 80" stroke="url(#st)" strokeWidth="1.2" />
            <path d="M200 900 L1500 260" stroke="url(#st)" strokeWidth=".6" />
            <path d="M-100 520 L900 -40" stroke="url(#st)" strokeWidth=".5" />
          </svg>

          <div className="hero__copy">
            <h1 className="hero__title">
              <span className="hero__line"><span>A gente encontra.</span></span>
              <span className="hero__line"><span>Você economiza<span className="lime">.</span></span></span>
            </h1>
            <p className="hero__sub">
              A gente confere cada promoção antes de mandar pro seu celular: preço real, link
              seguro, loja confiável. Sem corrente, sem spam, sem grupo VIP pago.
            </p>
            <CTAButtons />
            <div className="hero__proof">
              <span className="avatars" aria-hidden="true">
                <span style={{ background: "#C6FF00" }}>LP</span>
                <span style={{ background: "#D9D9D3" }}>MA</span>
                <span style={{ background: "#9FBF8A" }}>RJ</span>
                <span style={{ background: "#E8E8E2" }}>CS</span>
              </span>
              <p>
                <b>{NUMEROS.membros}</b> pessoas já fazem parte
              </p>
            </div>
          </div>

          <div className="hero__phone">
            <PhoneFeed />
          </div>
        </section>

        {/* A HISTÓRIA DE UMA OFERTA */}
        <section className="drop" id="como-funciona" data-from={console8.de} data-to={console8.por}>
          <div className="drop__stage">
            <div className="drop__glow" aria-hidden="true" />
            <div className="drop__intro">
              <h2>Uma oferta da ACHOU, do começo ao fim.</h2>
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
                <span className="drop__dot" />
                <time>09:14</time>
                <p>O preço cai numa loja parceira. Nosso robô percebe na hora.</p>
              </li>
              <li className="drop__step">
                <span className="drop__dot" />
                <time>09:16</time>
                <p>Alguém do time confere: histórico de preço, frete, vendedor e cupom.</p>
              </li>
              <li className="drop__step">
                <span className="drop__dot" />
                <time>09:17</time>
                <p>A oferta chega no seu Telegram e no WhatsApp, com o link certo.</p>
              </li>
              <li className="drop__step">
                <span className="drop__dot" />
                <time>09:31</time>
                <p>Esgotou. Quem estava no grupo pagou {brl(console8.de - console8.por)} a menos.</p>
              </li>
            </ol>
          </div>
        </section>

        {/* COMPARAÇÃO */}
        <section className="compare" id="comparar">
          <div className="compare__head">
            <h2>O mesmo fone. Três grupos.</h2>
            <p>
              Grupo de promoção tem aos montes. A diferença está no que chega até você e no que fica
              de fora.
            </p>
          </div>

          <div className="compare__grid">
            <SpamChat nome="Ofertas do Zé" membros="grupo · 4.812 membros" msgs={SPAM_ZE} />

            <div className="chat chat--achou">
              <header className="chat__head">
                <span className="chat__avatar chat__avatar--achou"><Bolt size={40} round /></span>
                <span>
                  <strong>ACHOU Ofertas</strong>
                  <small>canal · 3 ofertas hoje</small>
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
                  <a className="btn btn--lime btn--block" href={LINKS.telegram} target="_blank" rel="noopener">Ver oferta</a>
                </article>
              </div>
              <ul className="chat__verdict chat__verdict--good">
                <li><Check /> link conferido</li>
                <li><Check /> menor preço</li>
                <li><Check /> 3 mensagens hoje</li>
              </ul>
            </div>

            <SpamChat nome="Promoções da Ju" membros="grupo · 2.390 membros" msgs={SPAM_JU} />
          </div>
          <p className="compare__foot">O mesmo produto. A diferença é quem filtrou.</p>
        </section>

        {/* VITRINE */}
        <section className="shelf" id="ofertas">
          <div className="shelf__head">
            <h2>Achados desta semana</h2>
            <p>Uma amostra do que passou pelo grupo. Quando você ler isso, provavelmente já acabou.</p>
          </div>
          <div className="shelf__viewport">
            <div className="shelf__track">
              {[0, 1].map((copy) => (
                <div key={copy} className="shelf__set" aria-hidden={copy === 1 ? true : undefined}>
                  {OFERTAS.map((o) => (
                    <article key={o.id} className="deal">
                      <div className="deal__stage">
                        <Image src={o.img} alt={copy === 0 ? o.nome : ""} width={o.w} height={o.h} sizes="300px" />
                        <span className="deal__badge">-{desconto(o)}%</span>
                      </div>
                      <h3 className="deal__name">{o.nome}</h3>
                      <p className="deal__was">{brl(o.de)}</p>
                      <p className="deal__now"><span>Preço ACHOU</span> {brl(o.por)}</p>
                      <p className="deal__store">{o.loja} · já esgotado</p>
                    </article>
                  ))}
                  <a className="deal deal--more" href={LINKS.telegram} target="_blank" rel="noopener" tabIndex={copy === 1 ? -1 : undefined}>
                    <Bolt size={56} />
                    <span>As próximas chegam primeiro no grupo.</span>
                    <span className="btn btn--lime">Entrar agora</span>
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* POR QUE */}
        <section className="why">
          <h2 className="why__title">O que a gente promete.</h2>
          <dl className="why__list">
            <div>
              <dt>Só entra o que vale a pena</dt>
              <dd>Se o preço não é o menor dos últimos meses, não vai pro grupo. Simples assim.</dd>
            </div>
            <div>
              <dt>Link que funciona</dt>
              <dd>Testamos o link, o cupom e o vendedor antes de mandar. Nada de golpe ou página falsa.</dd>
            </div>
            <div>
              <dt>Poucas mensagens por dia</dt>
              <dd>Média de 3 a 6 ofertas por dia. Você pode deixar as notificações ligadas sem medo.</dd>
            </div>
            <div>
              <dt>De graça, sempre</dt>
              <dd>Não existe grupo VIP pago. A ACHOU ganha uma pequena comissão das lojas quando você compra, e o preço pra você não muda.</dd>
            </div>
          </dl>
        </section>

        {/* DÚVIDAS */}
        <section className="faq" id="duvidas">
          <h2>Dúvidas</h2>
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
              <p>Não. São de 3 a 6 ofertas por dia, nos horários em que as lojas mais baixam preço. Ninguém do grupo pode mandar mensagem, então não tem conversa paralela.</p>
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
          <Bolt size={120} className="final__bolt" />
          <h2>A próxima oferta já está a caminho.</h2>
          <p>Entre agora e receba antes de esgotar.</p>
          <CTAButtons />
        </section>
      </main>

      <footer className="foot">
        <div className="foot__brand">
          <Logo size={24} />
          <p>A gente encontra. Você economiza.</p>
        </div>
        <p className="foot__legal">
          A ACHOU participa de programas de afiliados de lojas parceiras. Preços e estoque podem
          mudar a qualquer momento. Imagens meramente ilustrativas.
        </p>
        <nav className="foot__links" aria-label="Rodapé">
          <a href="#">Termos de uso</a>
          <a href="#">Privacidade</a>
          <a href={LINKS.instagram}>Instagram</a>
          <a href={LINKS.tiktok}>TikTok</a>
        </nav>
        <p className="foot__copy">© 2026 ACHOU · achou.io</p>
      </footer>
    </>
  );
}

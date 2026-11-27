import type { Metadata } from "next";
import Link from "next/link";
import { isLoggedIn } from "@/lib/auth";
import { db, dbPronto, lerConfig } from "@/lib/automacao/db";
import { TEMPLATE_PADRAO } from "@/lib/automacao/oferta";
import { Logo } from "@/components/Logo";
import LoginForm from "../LoginForm";
import Sair from "../Sair";
import { BotaoEnviar } from "./BotaoEnviar";
import { BotaoGerarMeli } from "./BotaoGerarMeli";
import { Paginacao } from "../Paginacao";
import { Abas } from "./Abas";
import { AutoAtualizar } from "./AutoAtualizar";
import { BotaoResetar } from "./BotaoResetar";
import { GruposWhats } from "./GruposWhats";
import { WhatsConexao } from "./WhatsConexao";
import { whatsLigado } from "@/lib/automacao/whatsapp";
import {
  addCanal,
  addOferta,
  alternarAprovacaoAuto,
  alternarAtivo,
  alternarLinkAuto,
  dispararOferta,
  enviarAgora,
  mudarStatus,
  removerCanal,
  resetarTudo,
  rodarAgora,
  salvarConfig,
} from "./acoes";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Automação · ACHOU", robots: { index: false, follow: false } };

const ABAS = [
  ["fila", "Fila"],
  ["canais", "Canais"],
  ["config", "Configurar"],
] as const;
const STATUS = [
  ["pendente", "Esperando aprovação"],
  ["aprovada", "Na fila de envio"],
  ["enviada", "Enviadas"],
  ["erro", "Com erro"],
  ["descartada", "Descartadas"],
] as const;
const POR_PAGINA = 10;

const hora = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })
    : "—";

/** O agendador chamou nos últimos 3 minutos? */
function recente(iso: string | null) {
  return !!iso && new Date().getTime() - new Date(iso).getTime() < 3 * 60_000;
}

type SP = { aba?: string; s?: string; p?: string; ok?: string; erro?: string };

export default async function Automacao({ searchParams }: { searchParams: Promise<SP> }) {
  if (!(await isLoggedIn())) return <LoginForm />;
  const sp = await searchParams;
  const aba = ABAS.some(([a]) => a === sp.aba) ? sp.aba! : "fila";

  const topo = (
    <header className="adm__top">
      <Logo size={24} />
      <nav className="auto__nav" aria-label="Painel">
        <Link href="/admin">Leads</Link>
        <Link href="/admin/automacao" aria-current="page">
          Automação
        </Link>
      </nav>
      <div className="adm__actions">
        <Sair />
      </div>
    </header>
  );

  if (!dbPronto()) {
    return (
      <main className="adm">
        {topo}
        <p className="adm__aviso">
          Falta ligar o banco: coloque <b>SUPABASE_URL</b> e <b>SUPABASE_SERVICE_ROLE_KEY</b> nas variáveis do projeto na Vercel e rode{" "}
          <b>supabase/automacao.sql</b> no Supabase.
        </p>
      </main>
    );
  }

  // tudo numa rodada só (config, canais, contagens e a página da fila)
  const sFila = STATUS.some(([x]) => x === sp.s) ? sp.s! : "pendente";
  const pFila = Math.max(1, Number(sp.p) || 1);
  let cfg, canais, contagens, ofertas;
  try {
    [cfg, { data: canais }, { data: ofertas }, ...contagens] = await Promise.all([
      lerConfig(),
      db().from("auto_grupos").select("*").order("criado_em"),
      db()
        .from("auto_ofertas")
        .select("*")
        .eq("status", sFila)
        .order(sFila === "enviada" ? "enviado_em" : "criado_em", { ascending: sFila === "aprovada" })
        .range((pFila - 1) * POR_PAGINA, pFila * POR_PAGINA - 1),
      ...STATUS.map(([s]) => db().from("auto_ofertas").select("id", { count: "exact", head: true }).eq("status", s)),
    ]);
  } catch (e) {
    return (
      <main className="adm">
        {topo}
        <p className="adm__aviso">
          {(e as Error).message}. Rode o arquivo <b>supabase/automacao.sql</b> no SQL Editor do Supabase.
        </p>
      </main>
    );
  }
  const total = Object.fromEntries(STATUS.map(([s], i) => [s, (contagens[i] as { count: number | null }).count ?? 0]));
  const origens = (canais ?? []).filter((c) => c.tipo === "origem");
  const destinos = (canais ?? []).filter((c) => c.tipo === "destino");
  const cicloRecente = recente(cfg.ultimo_ciclo);

  const faltando = [
    !cfg.ml_matt_tool && "link de afiliado do Mercado Livre",
    !cfg.bot_token && "token do bot",
    !destinos.length && "canal de destino",
    !origens.length && "canal pra monitorar",
  ].filter(Boolean) as string[];

  return (
    <main className="adm">
      {topo}

      {sp.ok && <p className="auto__msg">{sp.ok}</p>}
      {sp.erro && <p className="adm__aviso">{sp.erro}</p>}

      <section className="auto__status">
        <div className="auto__robo">
          <span className={`auto__dot ${cicloRecente ? "is-on" : ""}`} />
          <div>
            <b>{cicloRecente ? "Robô rodando na nuvem" : "Robô parado"}</b>
            <small>
              {cicloRecente
                ? `última verificação ${hora(cfg.ultimo_ciclo)}`
                : "o agendador do Supabase ainda não chamou o site (rode o supabase/automacao.sql)"}
            </small>
          </div>
        </div>
        <div className="auto__toggles">
          <form action={alternarLinkAuto}>
            <input type="hidden" name="link_auto" value={cfg.link_automatico ? "0" : "1"} />
            <button
              className={`auto__toggle ${cfg.link_automatico ? "is-on" : ""}`}
              title={cfg.link_automatico ? "Gera o link meli.la pela extensão automaticamente em todas as ofertas" : "As ofertas saem com o link achou.io; use 'Gerar link meli.la' nas que quiser"}
            >
              {cfg.link_automatico ? "Link automático ligado" : "Link automático desligado"}
            </button>
          </form>
          <form action={alternarAprovacaoAuto}>
            <input type="hidden" name="aprovar_auto" value={cfg.aprovacao_manual ? "1" : "0"} />
            <button
              className={`auto__toggle ${!cfg.aprovacao_manual ? "is-on" : ""}`}
              title={!cfg.aprovacao_manual ? "Tudo que cai em esperando aprovação já é aprovado e enviado automaticamente" : "Novas ofertas esperam sua aprovação antes de entrar na fila de envio"}
            >
              {!cfg.aprovacao_manual ? "Aprovar/Enviar automático ligado" : "Aprovar/Enviar automático desligado"}
            </button>
          </form>
          <form action={alternarAtivo}>
            <input type="hidden" name="ativo" value={cfg.ativo ? "0" : "1"} />
            <button className={`auto__toggle ${cfg.ativo ? "is-on" : ""}`}>{cfg.ativo ? "Disparo ligado" : "Disparo desligado"}</button>
          </form>
        </div>
      </section>

      {faltando.length > 0 && (
        <p className="adm__aviso">
          Pra funcionar, falta: <b>{faltando.join(", ")}</b>.{" "}
          <Link href={`/admin/automacao?aba=${!cfg.ml_matt_tool || !cfg.bot_token ? "config" : "canais"}`}>Configurar agora</Link>
        </p>
      )}

      <section className="adm__stats">
        <div>
          <b>{total.pendente}</b>
          <span>esperando aprovação</span>
        </div>
        <div>
          <b>{total.aprovada}</b>
          <span>na fila de envio</span>
        </div>
        <div>
          <b>{total.enviada}</b>
          <span>enviadas</span>
        </div>
        <div>
          <b>{cfg.ativo && cfg.proximo_envio ? hora(cfg.proximo_envio) : "—"}</b>
          <span>próximo envio</span>
        </div>
      </section>

      <div className="auto__acoes">
        <form action={rodarAgora}>
          <BotaoEnviar className="adm__btn adm__btn--ghost" carregando="Verificando…">
            Verificar canais agora
          </BotaoEnviar>
        </form>
        <form action={enviarAgora}>
          <BotaoEnviar className="adm__btn adm__btn--ghost" carregando="Enviando…">
            Enviar próxima agora
          </BotaoEnviar>
        </form>
        <form action={resetarTudo}>
          <BotaoResetar />
        </form>
        <AutoAtualizar />
      </div>
      {cfg.ultimo_erro && <p className="adm__aviso">Último erro do envio: {cfg.ultimo_erro}</p>}

      <Abas
        inicial={aba}
        abas={[
          { id: "fila", nome: "Fila", conteudo: <Fila s={sFila} pagina={pFila} data={ofertas ?? []} total={total} /> },
          { id: "canais", nome: "Canais", conteudo: <Canais origens={origens} destinos={destinos} whats={whatsLigado()} /> },
          { id: "config", nome: "Configurar", conteudo: <Config cfg={cfg} /> },
        ]}
      />
    </main>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function Fila({ s, pagina, data, total }: { s: string; pagina: number; data: any[]; total: Record<string, number> }) {
  const paginas = Math.max(1, Math.ceil((total[s] ?? 0) / POR_PAGINA));
  const editavel = s !== "enviada";

  return (
    <section className="auto__secao">
      <details className="auto__nova">
        <summary>+ Adicionar oferta colando a mensagem</summary>
        <form action={addOferta} className="auto__form">
          <textarea name="mensagem" className="auto__campo" rows={6} placeholder="Cole aqui a mensagem com o link meli.la ou do Mercado Livre" required />
          <BotaoEnviar className="adm__btn" carregando="Convertendo…">
            Adicionar à fila
          </BotaoEnviar>
        </form>
      </details>

      <nav className="auto__filtros" aria-label="Status">
        {STATUS.map(([x, nome]) => (
          <Link key={x} href={`/admin/automacao?aba=fila&s=${x}`} aria-current={x === s ? "page" : undefined}>
            {nome} <span>{total[x] ?? 0}</span>
          </Link>
        ))}
      </nav>

      {!(data ?? []).length ? (
        <p className="auto__vazio">
          {s === "pendente" ? "Nada esperando aprovação. As ofertas dos canais monitorados aparecem aqui sozinhas." : "Nada por aqui."}
        </p>
      ) : (
        <ul className="auto__lista">
          {(data ?? []).map((o) => (
            <li key={o.id} className="auto__oferta">
              <div className="auto__meta">
                <span>{o.origem ?? "manual"}</span>
                <span>{hora(o.enviado_em ?? o.criado_em)}</span>
                {o.link_afiliado && (
                  <a href={o.link_afiliado} target="_blank" rel="noopener">
                    abrir link ↗
                  </a>
                )}
              </div>
              {o.imagem && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={o.imagem} alt="" className="auto__thumb" loading="lazy" />
              )}
              {o.motivo && <p className="auto__motivo">{o.motivo}</p>}
              <form action={mudarStatus} className="auto__form">
                <input type="hidden" name="id" value={o.id} />
                <input type="hidden" name="aba" value="fila" />
                <input type="hidden" name="volta" value={`s=${s}&p=${pagina}`} />
                <textarea
                  key={o.texto_final || o.texto_original}
                  name="texto"
                  className="auto__campo auto__mono"
                  rows={8}
                  defaultValue={o.texto_final || o.texto_original}
                  readOnly={!editavel}
                  aria-label="Texto da postagem"
                />
                {editavel && o.texto_final && (
                  <div className="auto__meli">
                    {/\/meli\.la\//.test(o.link_afiliado ?? "") && <span className="auto__estado">✓ Com meli.la da sua conta</span>}
                    <details className="auto__melimanual">
                      <summary>colar na mão</summary>
                      <input
                        name="meli"
                        type="url"
                        inputMode="url"
                        className="auto__campo"
                        placeholder="Cole um meli.la gerado na conta do Barr4k"
                        aria-label="Link meli.la do Barr4k"
                      />
                    </details>
                  </div>
                )}
                {editavel && (
                  <div className="auto__botoes">
                    {o.texto_final && !/\/meli\.la\//.test(o.link_afiliado ?? "") && (
                      <BotaoGerarMeli id={o.id} volta={`s=${s}&p=${pagina}`} status={s} />
                    )}
                    {s !== "aprovada" && o.texto_final && (
                      <button name="status" value="aprovada" className="adm__btn">
                        Aprovar
                      </button>
                    )}
                    {o.texto_final && (
                      <BotaoEnviar formAction={dispararOferta} className="adm__btn auto__disparar" carregando="Disparando…">
                        🚀 Disparar agora
                      </BotaoEnviar>
                    )}
                    {s === "aprovada" && (
                      <button name="status" value="pendente" className="adm__btn adm__btn--ghost">
                        Voltar pra aprovação
                      </button>
                    )}
                    {s !== "descartada" && (
                      <button name="status" value="descartada" className="adm__btn adm__btn--ghost">
                        Descartar
                      </button>
                    )}
                  </div>
                )}
              </form>
            </li>
          ))}
        </ul>
      )}

      <Paginacao pagina={pagina} paginas={paginas} total={total[s] ?? 0} link={(p) => `/admin/automacao?aba=fila&s=${s}&p=${p}`} />
    </section>
  );
}

type Canal = { id: string; chat: string; tipo: string; ultimo_post: number };

function Canais({ origens, destinos, whats }: { origens: Canal[]; destinos: Canal[]; whats: boolean }) {
  const lista = (titulo: string, ajuda: string, itens: Canal[]) => (
    <div className="auto__bloco">
      <h2>{titulo}</h2>
      <p className="auto__ajuda">{ajuda}</p>
      {itens.length === 0 ? (
        <p className="auto__vazio">Nenhum ainda.</p>
      ) : (
        <ul className="auto__canais">
          {itens.map((c) => (
            <li key={c.id}>
              {c.chat.startsWith("@") ? (
                <a href={`https://t.me/${c.chat.replace(/^@/, "")}`} target="_blank" rel="noopener">
                  {c.chat}
                </a>
              ) : (
                <span>📱 {c.chat.replace(/@g\.us$/, "")} (WhatsApp)</span>
              )}
              <form action={removerCanal}>
                <input type="hidden" name="id" value={c.id} />
                <button className="auto__remover" aria-label={`Remover ${c.chat}`}>
                  Remover
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
  return (
    <section className="auto__secao">
      <form action={addCanal} className="auto__linha">
        <input name="chat" className="auto__campo" placeholder="@canal ou t.me/canal" required aria-label="Canal" />
        <select name="tipo" className="auto__campo" aria-label="Tipo">
          <option value="origem">Monitorar (pegar ofertas)</option>
          <option value="destino">Postar nele</option>
        </select>
        <BotaoEnviar className="adm__btn" carregando="Salvando…">
          Adicionar
        </BotaoEnviar>
      </form>
      {lista("Canais monitorados", "Canais públicos de promoção. O robô lê os posts novos a cada minuto e pega os que têm link do Mercado Livre.", origens)}
      {lista("Onde o robô posta", "Telegram (o bot precisa ser admin) e WhatsApp (abaixo). A mesma arte e o mesmo texto vão pros dois.", destinos)}
      <WhatsConexao ligado={whats} />
      <GruposWhats ligado={whats} />
    </section>
  );
}

function Config({ cfg }: { cfg: Awaited<ReturnType<typeof lerConfig>> }) {
  return (
    <form action={salvarConfig} className="auto__secao auto__config">
      <div className="auto__bloco">
        <h2>Mercado Livre</h2>
        <p className="auto__ajuda">
          Cole um link de afiliado seu (gerado no painel de afiliados do Mercado Livre, pode ser o meli.la). O robô copia o seu código e usa
          em todas as ofertas.
        </p>
        <p className="auto__estado">
          {cfg.ml_matt_tool ? (
            <>
              ✓ Configurado (código <b>{cfg.ml_matt_tool}</b>
              {cfg.ml_matt_word ? (
                <>
                  , etiqueta <b>{cfg.ml_matt_word}</b>
                </>
              ) : null}
              )
            </>
          ) : (
            "Ainda não configurado"
          )}
        </p>
        <input name="link_ml" className="auto__campo" placeholder={cfg.ml_matt_tool ? "Cole outro link só se quiser trocar" : "https://meli.la/..."} />
      </div>

      <div className="auto__bloco">
        <h2>Link meli.la automático (extensão)</h2>
        <p className="auto__ajuda">
          Com a extensão da ACHOU instalada e conectada, os posts saem com o <b>meli.la</b> da sua conta. Sem ela, saem com o link
          achou.io (que leva o mesmo código de afiliado).
        </p>
        {cfg.ml_cookies ? (
          <p className="auto__estado">
            ✓ Conta conectada{cfg.ml_sessao_em ? ` em ${hora(cfg.ml_sessao_em)}` : ""}.
          </p>
        ) : (
          <p className="auto__estado">Ainda não conectada.</p>
        )}
        {cfg.ml_sessao_erro && <p className="auto__motivo">{cfg.ml_sessao_erro}</p>}
        {cfg.extensao_token ? (
          <>
            <p className="auto__ajuda">1) Baixe e instale a extensão. 2) Entre no Mercado Livre no Chrome. 3) Cole este token na extensão:</p>
            <input className="auto__campo auto__mono" readOnly defaultValue={cfg.extensao_token} aria-label="Token da extensão" />
            <a className="adm__btn adm__btn--ghost" href="/extensao-achou.zip" download style={{ marginTop: 8, display: "inline-flex" }}>
              Baixar a extensão
            </a>
          </>
        ) : (
          <p className="auto__motivo">Rode o arquivo <b>supabase/meli.sql</b> no Supabase pra liberar o token da extensão.</p>
        )}
      </div>

      <div className="auto__bloco">
        <h2>Bot do Telegram</h2>
        <p className="auto__ajuda">Token que o @BotFather te deu. Depois coloque o bot como administrador do canal onde ele vai postar.</p>
        <p className="auto__estado">{cfg.bot_token ? "✓ Token salvo" : "Ainda sem token"}</p>
        <input
          name="bot_token"
          type="password"
          autoComplete="off"
          className="auto__campo"
          placeholder={cfg.bot_token ? "Cole outro token só se quiser trocar" : "123456789:AA..."}
        />
      </div>

      <div className="auto__bloco">
        <h2>Quando postar</h2>
        <p className="auto__ajuda">Aprovação manual e disparo ligam e desligam nos botões lá em cima.</p>
        <div className="auto__grade">
          <label>
            <span>Começa às (h)</span>
            <input name="hora_inicio" type="number" inputMode="numeric" min={0} max={23} defaultValue={cfg.hora_inicio} className="auto__campo" />
          </label>
          <label>
            <span>Para às (h)</span>
            <input name="hora_fim" type="number" inputMode="numeric" min={1} max={24} defaultValue={cfg.hora_fim} className="auto__campo" />
          </label>
          <label>
            <span>Intervalo mín. (min)</span>
            <input name="intervalo_min" type="number" inputMode="numeric" min={1} max={600} defaultValue={cfg.intervalo_min} className="auto__campo" />
          </label>
          <label>
            <span>Intervalo máx. (min)</span>
            <input name="intervalo_max" type="number" inputMode="numeric" min={1} max={600} defaultValue={cfg.intervalo_max} className="auto__campo" />
          </label>
        </div>
      </div>

      <div className="auto__bloco">
        <h2>Filtro e texto</h2>
        <label>
          <span className="auto__ajuda">Palavras bloqueadas (uma por linha): oferta com elas fica de fora</span>
          <textarea name="palavras_bloqueadas" rows={3} className="auto__campo" defaultValue={cfg.palavras_bloqueadas.join("\n")} />
        </label>
        <label>
          <span className="auto__ajuda">
            Modelo do post. Variáveis: {"{chamada} {titulo} {preco} {preco_antigo} {desconto} {economia} {cupom} {link} {fechamento}"} · trecho opcional:{" "}
            {"[[se cupom]] ... [[/se]]"} · {"~texto~"} fica riscado.
          </span>
          <textarea name="template" rows={10} className="auto__campo auto__mono" defaultValue={cfg.template || TEMPLATE_PADRAO} />
        </label>
      </div>

      <div className="auto__salvar">
        <BotaoEnviar className="adm__btn" carregando="Salvando…">
          Salvar configurações
        </BotaoEnviar>
      </div>
    </form>
  );
}

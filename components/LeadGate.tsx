"use client";

import { useEffect, useRef, useState } from "react";
import { TelegramIcon, WhatsIcon } from "./Icons";
import { rastrear, visitante } from "@/lib/rastrear";
import { CATEGORIAS } from "@/lib/categorias";

// Antes de liberar o grupo, a pessoa deixa nome, e-mail e telefone.
// Quem já se cadastrou neste navegador vai direto (o link fica guardado no localStorage).

type Canal = "telegram" | "whatsapp";
const EVENTO = "achou:entrar";
const GUARDADO = "achou_lead_v2";

export function abrirCadastro(canal: Canal, origem: string) {
  window.dispatchEvent(new CustomEvent(EVENTO, { detail: { canal, origem } }));
}

function linkGuardado(canal: Canal): string | null {
  try {
    const o = JSON.parse(localStorage.getItem(GUARDADO) || "{}");
    return typeof o[canal] === "string" ? o[canal] : null;
  } catch {
    return null;
  }
}

function guardarLink(canal: Canal, url: string) {
  try {
    const o = JSON.parse(localStorage.getItem(GUARDADO) || "{}");
    o[canal] = url;
    localStorage.setItem(GUARDADO, JSON.stringify(o));
  } catch {}
}

/** Quem já se cadastrou vai direto pro grupo; quem não, vê o cadastro */
export function entrar(canal: Canal, origem: string) {
  const url = linkGuardado(canal);
  rastrear("clique", { c: canal, o: origem });
  if (url) {
    rastrear("grupo", { c: canal, o: origem });
    window.open(url, "_blank", "noopener");
  } else abrirCadastro(canal, origem);
}

/** Link/botão que passa pelo cadastro antes de abrir o grupo */
export function GateLink({
  canal = "telegram",
  origem,
  className,
  children,
}: {
  canal?: Canal;
  origem: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href="#entrar"
      className={className}
      onClick={(e) => {
        e.preventDefault();
        entrar(canal, origem);
      }}
    >
      {children}
    </a>
  );
}

const mascara = (v: string) => {
  const d = v.replace(/\D/g, "").replace(/^55(?=\d{10,11}$)/, "").slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
};

export function LeadModal() {
  const [aberto, setAberto] = useState(false);
  const [canal, setCanal] = useState<Canal>("telegram");
  const [origem, setOrigem] = useState("");
  const nome = ""; // o cadastro novo pede só e-mail e WhatsApp
  const [email, setEmail] = useState("");
  const [tel, setTel] = useState("");
  const [ok, setOk] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [url, setUrl] = useState<string | null>(null);
  const [interesses, setInteresses] = useState<string[]>([]);
  const [salvo, setSalvo] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const primeiro = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const abrir = (e: Event) => {
      const d = (e as CustomEvent).detail as { canal: Canal; origem: string };
      setCanal(d.canal);
      setOrigem(d.origem);
      setErro("");
      setUrl(null);
      setSalvo(false);
      setInteresses([]);
      setAberto(true);
    };
    window.addEventListener(EVENTO, abrir);
    return () => window.removeEventListener(EVENTO, abrir);
  }, []);

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (aberto && !d.open) {
      d.showModal();
      setTimeout(() => primeiro.current?.focus(), 50);
    }
    if (!aberto && d.open) d.close();
  }, [aberto]);

  const enviar = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErro("");
    setEnviando(true);
    const site = (new FormData(e.currentTarget).get("site") as string) || "";
    try {
      const r = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, email, telefone: tel, canal, consentimento: ok, origem, site, v: visitante() }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.error || "Não deu pra enviar. Tente de novo.");
      guardarLink(canal, j.url);
      setUrl(j.url);
    } catch (err) {
      setErro((err as Error).message);
    } finally {
      setEnviando(false);
    }
  };

  const nomeCanal = canal === "whatsapp" ? "comunidade do WhatsApp" : "grupo do Telegram";

  const alternar = (c: string) => setInteresses((x) => (x.includes(c) ? x.filter((y) => y !== c) : [...x, c]));
  const salvarInteresses = async () => {
    setErro("");
    setEnviando(true);
    try {
      const r = await fetch("/api/lead/interesses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, interesses }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.error || "Não deu pra salvar. Tente de novo.");
      setSalvo(true);
    } catch (err) {
      setErro((err as Error).message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <dialog ref={dialog} className="gate" onClose={() => setAberto(false)} onClick={(e) => e.target === dialog.current && setAberto(false)}>
      <div className="gate__box">
        <button type="button" className="gate__x" aria-label="Fechar" onClick={() => setAberto(false)}>
          ×
        </button>

        {url ? (
          <div className="gate__done">
            <span className="gate__selo">Acesso liberado</span>
            <h2>Tudo certo!</h2>
            <p>Seu acesso ao {nomeCanal} está liberado.</p>
            <a className="gate__go" href={url} target="_blank" rel="noopener" onClick={() => rastrear("grupo", { c: canal, o: origem })}>
              {canal === "whatsapp" ? <WhatsIcon size={18} /> : <TelegramIcon size={18} />}
              Abrir {canal === "whatsapp" ? "o WhatsApp" : "o Telegram"}
            </a>

            {/* etapa opcional: interesses, pra mandar ofertas certas no futuro */}
            <div className="gate__extra">
              {salvo ? (
                <p className="gate__ok">Perfeito! Agora você vai receber exatamente o que te interessa.</p>
              ) : (
                <>
                  <h3>
                    Personalize suas ofertas <small>(opcional)</small>
                  </h3>
                  <p>Escolha o que mais te interessa.</p>
                  <div className="gate__cats">
                    {CATEGORIAS.map(([k, nome]) => (
                      <button key={k} type="button" className={interesses.includes(k) ? "is-on" : ""} aria-pressed={interesses.includes(k)} onClick={() => alternar(k)}>
                        {nome}
                      </button>
                    ))}
                  </div>
                  {erro && <p className="gate__erro" role="alert">{erro}</p>}
                  <button type="button" className="gate__salvar" disabled={!interesses.length || enviando} onClick={salvarInteresses}>
                    {enviando ? "Salvando…" : "Salvar meus interesses"}
                  </button>
                </>
              )}
            </div>
          </div>
        ) : (
          <form onSubmit={enviar} noValidate>
            <span className="gate__selo">Acesso gratuito</span>
            <h2>Entre para a ACHOU!</h2>
            <p className="gate__lema">As melhores ofertas, direto no seu celular.</p>
            <p>Cadastre-se gratuitamente e desbloqueie o nosso {nomeCanal}.</p>

            <label className="gate__field">
              <span>E-mail</span>
              <input
                ref={primeiro}
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="seuemail@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>
            <label className="gate__field">
              <span>WhatsApp</span>
              <input
                type="tel"
                inputMode="tel"
                autoComplete="tel-national"
                placeholder="(11) 99999-9999"
                value={tel}
                onChange={(e) => setTel(mascara(e.target.value))}
                required
              />
            </label>
            {/* isca para robôs: invisível para pessoas */}
            <input className="gate__hp" type="text" name="site" tabIndex={-1} autoComplete="off" aria-hidden="true" />

            <label className="gate__check">
              <input type="checkbox" checked={ok} onChange={(e) => setOk(e.target.checked)} />
              <span>
                Aceito receber ofertas da ACHOU e concordo com os{" "}
                <a href="/termos" target="_blank">Termos de Uso</a> e a{" "}
                <a href="/privacidade" target="_blank">Política de Privacidade</a>.
              </span>
            </label>

            {erro && <p className="gate__erro" role="alert">{erro}</p>}

            <button className="gate__go gate__go--grande" type="submit" disabled={enviando}>
              {enviando ? "Liberando…" : "Liberar meu acesso gratuito →"}
            </button>
            <p className="gate__nota">Seus dados ficam protegidos. Você pode parar de receber as ofertas quando quiser.</p>
          </form>
        )}
      </div>
    </dialog>
  );
}

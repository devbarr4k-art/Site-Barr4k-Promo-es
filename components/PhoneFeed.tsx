"use client";

import { useEffect, useRef, useState } from "react";
import { OFERTAS, brl, desconto } from "@/lib/config";
import { Bolt } from "./Logo";
import Image from "next/image";

const HORAS = ["09:14", "09:31", "10:02", "10:47", "11:15", "11:38", "12:06"];
const VIEWS = ["38,2 mil", "41,7 mil", "52,9 mil", "36,4 mil", "47,1 mil"];

type Msg = { key: number; idx: number; hora: string };

function StatusIcons() {
  return (
    <span className="ios__icons" aria-hidden="true">
      {/* sinal */}
      <svg width="19" height="12" viewBox="0 0 19 12">
        <rect x="0" y="7.5" width="3.4" height="4.5" rx="0.9" fill="#fff" />
        <rect x="5.2" y="5" width="3.4" height="7" rx="0.9" fill="#fff" />
        <rect x="10.4" y="2.5" width="3.4" height="9.5" rx="0.9" fill="#fff" />
        <rect x="15.6" y="0" width="3.4" height="12" rx="0.9" fill="#fff" />
      </svg>
      {/* wi-fi */}
      <svg width="17" height="12" viewBox="0 0 17 12">
        <path fill="#fff" d="M8.5 2.4c2.3 0 4.4.9 6 2.4.1.1.4.1.5 0l1.2-1.2c.1-.1.1-.4 0-.5A10.3 10.3 0 0 0 .8 3.1c-.1.1-.1.4 0 .5L2 4.8c.1.1.4.1.5 0a8.6 8.6 0 0 1 6-2.4Z" />
        <path fill="#fff" d="M8.5 6.3c1.3 0 2.5.5 3.4 1.3.2.1.4.1.5 0l1.2-1.2c.1-.1.1-.4 0-.5a7 7 0 0 0-10.2 0c-.1.1-.1.4 0 .5l1.2 1.2c.1.1.4.1.5 0 .9-.8 2.1-1.3 3.4-1.3Z" />
        <path fill="#fff" d="M10.8 9.2c.1-.1.1-.4 0-.5a3.4 3.4 0 0 0-4.6 0c-.1.1-.1.4 0 .5l2 2c.1.1.4.1.5 0l2.1-2Z" />
      </svg>
      {/* bateria */}
      <svg width="27" height="13" viewBox="0 0 27 13">
        <rect x="0.5" y="0.5" width="23" height="12" rx="3.8" fill="none" stroke="#fff" strokeOpacity="0.38" />
        <rect x="2" y="2" width="18" height="9" rx="2.4" fill="#fff" />
        <path d="M25 4.3v4.4a2.4 2.4 0 0 0 0-4.4Z" fill="#fff" fillOpacity="0.4" />
      </svg>
    </span>
  );
}

export function PhoneFeed() {
  const [msgs, setMsgs] = useState<Msg[]>([
    { key: 0, idx: 2, hora: "08:52" },
    { key: 1, idx: 1, hora: "09:03" },
  ]);
  const [aviso, setAviso] = useState<Msg | null>(null);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    let n = 2;
    const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms));
    const tick = () => {
      const m: Msg = { key: n, idx: n % OFERTAS.length, hora: HORAS[n % HORAS.length] };
      n += 1;
      setAviso(m);
      later(() => setMsgs((prev) => [...prev.slice(-2), m]), 1100);
      later(() => setAviso(null), 3600);
    };
    later(tick, 1800);
    const loop = window.setInterval(tick, 6000);
    const list = timers.current;
    return () => {
      window.clearInterval(loop);
      list.forEach(window.clearTimeout);
    };
  }, []);

  const o = aviso ? OFERTAS[aviso.idx] : null;

  return (
    <div className="phone" aria-label="Prévia do canal da ACHOU no Telegram">
      <span className="phone__btn phone__btn--action" />
      <span className="phone__btn phone__btn--volup" />
      <span className="phone__btn phone__btn--voldown" />
      <span className="phone__btn phone__btn--power" />

      <div className="phone__body">
        <div className="phone__screen">
          <div className="ios__status">
            <span className="ios__time">9:41</span>
            <StatusIcons />
          </div>

          <div className={`island ${o ? "is-open" : ""}`} aria-live="polite">
            <div className="island__banner">
              {o && (
                <>
                  <span className="island__icon"><Bolt size={42} /></span>
                  <span className="island__text">
                    <span className="island__row">
                      <strong>ACHOU Ofertas</strong>
                      <span>agora</span>
                    </span>
                    <span className="island__line">{o.nome}</span>
                    <span className="island__line">
                      De {brl(o.de)} por <b>{brl(o.por)}</b> (-{desconto(o)}%)
                    </span>
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="tg__head">
            <span className="tg__back">
              <svg width="11" height="19" viewBox="0 0 11 19" aria-hidden="true">
                <path d="M9.5 1.5 2 9.5l7.5 8" stroke="currentColor" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="tg__title">
              <strong>ACHOU Ofertas</strong>
              <small>523.418 inscritos</small>
            </span>
            <span className="tg__avatar"><Bolt size={38} round /></span>
          </div>

          <div className="tg__pinned">
            <span className="tg__pinbar" />
            <span>
              <strong>Mensagem fixada</strong>
              <small>Só entra aqui o que a gente conferiu.</small>
            </span>
          </div>

          <div className="tg__feed">
            <span className="tg__date">Hoje</span>
            {msgs.map((m) => {
              const of = OFERTAS[m.idx];
              return (
                <div key={m.key} className="tg__post">
                  <article className="tg__msg">
                    <div className="tg__media">
                      <Image src={of.img} alt="" width={of.w} height={of.h} sizes="200px" />
                    </div>
                    <div className="tg__text">
                      <p className="tg__tag">⚡ -{desconto(of)}% · menor preço em 90 dias</p>
                      <p className="tg__name">{of.nome}</p>
                      <p className="tg__prices">
                        <s>{brl(of.de)}</s> <strong>{brl(of.por)}</strong>
                      </p>
                      <p className="tg__meta">
                        <span>👁 {VIEWS[m.key % VIEWS.length]}</span>
                        <time>{m.hora}</time>
                      </p>
                    </div>
                  </article>
                  <span className="tg__btn">Ver oferta ↗</span>
                </div>
              );
            })}
          </div>

          <div className="tg__bottom">
            <span>Silenciar</span>
          </div>
          <span className="ios__home" />
          <span className="phone__glare" />
        </div>
      </div>
      <span className="phone__shadow" aria-hidden="true" />
    </div>
  );
}

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
      <svg width="17" height="11" viewBox="0 0 18 12">
        <rect x="0" y="8" width="3" height="4" rx="1" fill="currentColor" />
        <rect x="5" y="5.5" width="3" height="6.5" rx="1" fill="currentColor" />
        <rect x="10" y="3" width="3" height="9" rx="1" fill="currentColor" />
        <rect x="15" y="0" width="3" height="12" rx="1" fill="currentColor" />
      </svg>
      <svg width="15" height="11" viewBox="0 0 16 12">
        <path d="M8 11.5 10.3 9a3.3 3.3 0 0 0-4.6 0L8 11.5Z" fill="currentColor" />
        <path d="M3.6 6.9a6.2 6.2 0 0 1 8.8 0l1.4-1.5a8.3 8.3 0 0 0-11.6 0l1.4 1.5Z" fill="currentColor" />
        <path d="M.9 4a10 10 0 0 1 14.2 0l1-1.1a11.6 11.6 0 0 0-16.2 0L.9 4Z" fill="currentColor" />
      </svg>
      <svg width="25" height="12" viewBox="0 0 27 13">
        <rect x=".5" y=".5" width="23" height="12" rx="3.6" fill="none" stroke="currentColor" opacity=".4" />
        <rect x="2" y="2" width="17" height="9" rx="2.2" fill="currentColor" />
        <path d="M25 4.5v4c.8-.3 1.3-1.1 1.3-2s-.5-1.7-1.3-2Z" fill="currentColor" opacity=".45" />
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

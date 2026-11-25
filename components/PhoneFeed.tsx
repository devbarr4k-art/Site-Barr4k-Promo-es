"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { OFERTAS, brl, desconto } from "@/lib/config";
import { Bolt } from "./Logo";

const HORAS = ["09:14", "09:31", "10:02", "10:47", "11:15", "11:38", "12:06"];

type Msg = { key: number; idx: number; hora: string };

export function PhoneFeed() {
  const [msgs, setMsgs] = useState<Msg[]>([
    { key: 0, idx: 2, hora: "08:52" },
    { key: 1, idx: 1, hora: "09:03" },
  ]);
  const [aviso, setAviso] = useState<Msg | null>(null);

  useEffect(() => {
    let n = 2;
    const tick = () => {
      const m: Msg = { key: n, idx: n % OFERTAS.length, hora: HORAS[n % HORAS.length] };
      n += 1;
      setAviso(m);
      window.setTimeout(() => setMsgs((prev) => [...prev.slice(-2), m]), 900);
      window.setTimeout(() => setAviso(null), 3200);
    };
    const first = window.setTimeout(tick, 1600);
    const loop = window.setInterval(tick, 5200);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(loop);
    };
  }, []);

  return (
    <div className="phone" aria-label="Prévia do canal da ACHOU no Telegram">
      <div className="phone__frame">
        <div className="phone__screen">
          <div className="phone__status">
            <span>9:41</span>
            <span className="phone__island" />
            <span className="phone__icons">
              <i /> <i /> <b />
            </span>
          </div>

          <div className={`notif ${aviso ? "is-on" : ""}`} aria-live="polite">
            {aviso && (
              <>
                <span className="notif__icon"><Bolt size={16} /></span>
                <span className="notif__body">
                  <strong>ACHOU Ofertas</strong>
                  <span>
                    {OFERTAS[aviso.idx].nome} caiu para {brl(OFERTAS[aviso.idx].por)}
                  </span>
                </span>
                <span className="notif__time">agora</span>
              </>
            )}
          </div>

          <div className="tg__head">
            <span className="tg__back">‹</span>
            <span className="tg__avatar"><Bolt size={18} /></span>
            <span className="tg__title">
              <strong>ACHOU Ofertas</strong>
              <small>canal · notificações ativas</small>
            </span>
          </div>
          <div className="tg__pinned">
            <span className="tg__pinbar" />
            <span>
              <strong>Mensagem fixada</strong>
              <small>Só entra aqui o que a gente conferiu.</small>
            </span>
          </div>

          <div className="tg__feed">
            {msgs.map((m) => {
              const o = OFERTAS[m.idx];
              return (
                <article key={m.key} className="tg__msg">
                  <div className="tg__media">
                    <Image src={o.img} alt="" width={o.w} height={o.h} sizes="200px" />
                    <span className="tg__badge">-{desconto(o)}%</span>
                  </div>
                  <p className="tg__name">{o.nome}</p>
                  <p className="tg__prices">
                    <s>{brl(o.de)}</s> <strong>{brl(o.por)}</strong>
                  </p>
                  <p className="tg__meta">
                    <span>Preço conferido</span>
                    <time>{m.hora}</time>
                  </p>
                  <span className="tg__btn">Ver oferta</span>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

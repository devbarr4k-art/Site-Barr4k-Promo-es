"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { OFERTAS, brl, desconto } from "@/lib/config";
import { entrar } from "./LeadGate";

// Lista de ofertas em linhas. No desktop, a foto do produto segue o mouse.
export function IndexList() {
  const [ativo, setAtivo] = useState<number | null>(null);
  const preview = useRef<HTMLDivElement>(null);

  const mover = (e: React.MouseEvent) => {
    const el = preview.current;
    if (!el) return;
    el.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
  };

  return (
    <div className="idx" onMouseMove={mover} onMouseLeave={() => setAtivo(null)}>
      <div className="idx__row idx__row--head" aria-hidden="true">
        <span>Nº</span>
        <span>Produto</span>
        <span>Antes</span>
        <span>Preço ACHOU</span>
        <span>Desconto</span>
      </div>
      <ol className="idx__list">
        {OFERTAS.map((o, i) => (
          <li key={o.id}>
            <a
              className={`idx__row ${ativo === i ? "is-on" : ""}`}
              href="#entrar"
              onClick={(e) => {
                e.preventDefault();
                entrar("telegram", "indice");
              }}
              onMouseEnter={() => setAtivo(i)}
              onFocus={() => setAtivo(i)}
            >
              <span className="idx__n">{String(i + 1).padStart(2, "0")}</span>
              <span className="idx__name">
                <Image className="idx__thumb" src={o.img} alt="" width={o.w} height={o.h} sizes="72px" />
                {o.nome}
              </span>
              <s className="idx__was">{brl(o.de)}</s>
              <b className="idx__now">{brl(o.por)}</b>
              <span className="idx__off">-{desconto(o)}%</span>
            </a>
          </li>
        ))}
      </ol>

      <div ref={preview} className="idx__preview" aria-hidden="true">
        {OFERTAS.map((o, i) => (
          <Image
            key={o.id}
            className={ativo === i ? "is-on" : undefined}
            src={o.img}
            alt=""
            width={o.w}
            height={o.h}
            sizes="360px"
          />
        ))}
      </div>
    </div>
  );
}

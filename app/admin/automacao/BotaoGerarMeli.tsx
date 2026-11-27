"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { gerarLinkOferta } from "./acoes";

// Botão "Gerar link meli.la": abre um popup perguntando se quer só gerar o meli.la ou já aprovar também.
export function BotaoGerarMeli({ id, volta, status }: { id: string; volta: string; status: string }) {
  const [aberto, setAberto] = useState(false);
  const [modo, setModo] = useState<"0" | "1" | null>(null);
  const [ocupado, iniciar] = useTransition();
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (aberto && !d.open) d.showModal();
    if (!aberto && d.open) d.close();
  }, [aberto]);

  const executar = (aprovar: "0" | "1") => {
    setModo(aprovar);
    iniciar(async () => {
      const fd = new FormData();
      fd.set("id", id);
      fd.set("volta", volta);
      fd.set("aprovar", aprovar);
      try {
        await gerarLinkOferta(fd);
      } finally {
        setAberto(false);
        setModo(null);
      }
    });
  };

  const podeAprovar = status !== "aprovada";

  return (
    <>
      <button type="button" className="adm__btn auto__gerar" onClick={() => setAberto(true)}>
        🔗 Gerar link meli.la
      </button>

      {aberto &&
        createPortal(
          <dialog
            ref={dialog}
            className="gate adm__confirm auto__meli-popup"
            onClose={() => !ocupado && setAberto(false)}
            onClick={(e) => e.target === dialog.current && !ocupado && setAberto(false)}
          >
            <div className="gate__box">
              <button type="button" className="gate__x" aria-label="Fechar" onClick={() => !ocupado && setAberto(false)} disabled={ocupado}>
                ×
              </button>
              <h2>Gerar link meli.la</h2>
              <p>
                {podeAprovar
                  ? "Você quer apenas gerar e colocar o link meli.la na legenda, ou gerar e já aprovar a oferta direto para envio?"
                  : "Gerar o link meli.la pela sua conta e atualizar a legenda desta oferta?"}
              </p>
              <div className="auto__meli-acoes">
                {podeAprovar && (
                  <button type="button" className="adm__btn" onClick={() => executar("1")} disabled={ocupado}>
                    {ocupado && modo === "1" ? "Gerando e aprovando…" : "Gerar meli.la e aprovar direto"}
                  </button>
                )}
                <button type="button" className={`adm__btn ${podeAprovar ? "adm__btn--ghost" : ""}`} onClick={() => executar("0")} disabled={ocupado}>
                  {ocupado && modo === "0" ? "Gerando…" : "Apenas gerar o link meli.la"}
                </button>
                <button type="button" className="adm__btn adm__btn--ghost" onClick={() => setAberto(false)} disabled={ocupado}>
                  Cancelar
                </button>
              </div>
            </div>
          </dialog>,
          document.body,
        )}
    </>
  );
}

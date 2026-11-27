"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal, useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { gerarLinkOferta } from "./acoes";

function ConteudoPopup({
  podeAprovar,
  modo,
  setModo,
  aoFechar,
  aoConcluir,
}: {
  podeAprovar: boolean;
  modo: "0" | "1" | null;
  setModo: (m: "0" | "1") => void;
  aoFechar: () => void;
  aoConcluir: () => void;
}) {
  const { pending } = useFormStatus();
  const estavaOcupado = useRef(false);

  useEffect(() => {
    if (pending) {
      estavaOcupado.current = true;
    } else if (estavaOcupado.current) {
      estavaOcupado.current = false;
      aoConcluir();
    }
  }, [pending, aoConcluir]);

  return (
    <div className="gate__box">
      <button type="button" className="gate__x" aria-label="Fechar" onClick={() => !pending && aoFechar()} disabled={pending}>
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
          <button type="submit" name="aprovar" value="1" className="adm__btn" onClick={() => setModo("1")} disabled={pending}>
            {pending && modo === "1" ? "Gerando e aprovando…" : "Gerar meli.la e aprovar direto"}
          </button>
        )}
        <button
          type="submit"
          name="aprovar"
          value="0"
          className={`adm__btn ${podeAprovar ? "adm__btn--ghost" : ""}`}
          onClick={() => setModo("0")}
          disabled={pending}
        >
          {pending && modo === "0" ? "Gerando…" : "Apenas gerar o link meli.la"}
        </button>
        <button type="button" className="adm__btn adm__btn--ghost" onClick={aoFechar} disabled={pending}>
          Cancelar
        </button>
      </div>
    </div>
  );
}

// Botão "Gerar link meli.la": abre um popup perguntando se quer só gerar o meli.la ou já aprovar também.
export function BotaoGerarMeli({ id, volta, status }: { id: string; volta: string; status: string }) {
  const router = useRouter();
  const [aberto, setAberto] = useState(false);
  const [modo, setModo] = useState<"0" | "1" | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (aberto && !d.open) d.showModal();
    if (!aberto && d.open) d.close();
  }, [aberto]);

  const concluir = useCallback(() => {
    setAberto(false);
    setModo(null);
    router.refresh();
  }, [router]);

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
            onClose={() => {
              setAberto(false);
              setModo(null);
            }}
            onClick={(e) => e.target === dialog.current && setAberto(false)}
          >
            <form action={gerarLinkOferta}>
              <input type="hidden" name="id" value={id} />
              <input type="hidden" name="volta" value={volta} />
              <ConteudoPopup
                podeAprovar={podeAprovar}
                modo={modo}
                setModo={setModo}
                aoFechar={() => {
                  setAberto(false);
                  setModo(null);
                }}
                aoConcluir={concluir}
              />
            </form>
          </dialog>,
          document.body,
        )}
    </>
  );
}

"use client";

import { useFormStatus } from "react-dom";

// Pede confirmação antes de limpar só as ofertas em "Esperando aprovação".
export function BotaoResetar() {
  const { pending } = useFormStatus();
  return (
    <button
      className="adm__btn adm__btn--ghost auto__perigo"
      disabled={pending}
      onClick={(e) => {
        if (
          !confirm(
            "Limpar TODAS as ofertas de 'Esperando aprovação' e puxar só as últimas promoções dos canais?\n\nAs ofertas já aprovadas na fila de envio, enviadas, canais e configurações continuam.",
          )
        ) {
          e.preventDefault();
        }
      }}
    >
      {pending ? "Limpando…" : "Limpar fila de aprovação"}
    </button>
  );
}

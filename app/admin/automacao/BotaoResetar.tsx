"use client";

import { useFormStatus } from "react-dom";

// Pede confirmação antes de apagar a fila inteira.
export function BotaoResetar() {
  const { pending } = useFormStatus();
  return (
    <button
      className="adm__btn adm__btn--ghost auto__perigo"
      disabled={pending}
      onClick={(e) => {
        if (!confirm("Apagar TODAS as ofertas da fila (esperando, na fila de envio, enviadas, com erro e descartadas) e recomeçar a leitura dos canais?\n\nCanais e configurações continuam.")) e.preventDefault();
      }}
    >
      {pending ? "Resetando…" : "Resetar tudo"}
    </button>
  );
}

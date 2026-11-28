"use client";

import { useFormStatus } from "react-dom";

// Botão de ação destrutiva com confirmação antes de enviar o formulário.
export function BotaoResetar({
  rotulo = "Limpar fila de aprovação",
  carregando = "Limpando…",
  confirmacao = "Limpar TODAS as ofertas de 'Esperando aprovação' e puxar só as últimas promoções dos canais?\n\nAs ofertas já aprovadas na fila de envio, enviadas, canais e configurações continuam.",
}: {
  rotulo?: string;
  carregando?: string;
  confirmacao?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      className="adm__btn adm__btn--ghost auto__perigo"
      disabled={pending}
      onClick={(e) => {
        if (!confirm(confirmacao)) e.preventDefault();
      }}
    >
      {pending ? carregando : rotulo}
    </button>
  );
}

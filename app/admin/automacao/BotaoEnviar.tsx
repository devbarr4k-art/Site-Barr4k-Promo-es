"use client";

import { useFormStatus } from "react-dom";

// Botão de formulário que mostra "Salvando…" e trava enquanto o servidor responde.
export function BotaoEnviar({ children, carregando, className }: { children: React.ReactNode; carregando: string; className: string }) {
  const { pending } = useFormStatus();
  return (
    <button className={className} disabled={pending} aria-busy={pending}>
      {pending ? carregando : children}
    </button>
  );
}

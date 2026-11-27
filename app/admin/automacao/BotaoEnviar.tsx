"use client";

import { useFormStatus } from "react-dom";

// Botão de formulário que mostra "Salvando…" e trava enquanto o servidor responde.
export function BotaoEnviar({
  children,
  carregando,
  className,
  formAction,
}: {
  children: React.ReactNode;
  carregando: string;
  className: string;
  formAction?: (f: FormData) => void | Promise<void>;
}) {
  const { pending } = useFormStatus();
  return (
    <button className={className} disabled={pending} aria-busy={pending} formAction={formAction}>
      {pending ? carregando : children}
    </button>
  );
}

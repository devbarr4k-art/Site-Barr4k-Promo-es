"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Recarrega os dados do painel sozinho (o robô roda a cada minuto na nuvem).
// Não atualiza se a aba está escondida ou se a pessoa está editando um texto.
export function AutoAtualizar({ segundos = 20 }: { segundos?: number }) {
  const router = useRouter();
  const [hora, setHora] = useState("");
  useEffect(() => {
    const editando = () => {
      const a = document.activeElement;
      if (a && /^(TEXTAREA|INPUT|SELECT)$/.test(a.tagName)) return true;
      return [...document.querySelectorAll("textarea")].some((t) => t.value !== t.defaultValue);
    };
    const id = setInterval(() => {
      if (document.hidden || editando()) return;
      router.refresh();
      setHora(new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    }, segundos * 1000);
    return () => clearInterval(id);
  }, [router, segundos]);
  return (
    <span className="auto__vivo" title="O painel se atualiza sozinho">
      <i /> atualiza sozinho{hora && ` · ${hora}`}
    </span>
  );
}

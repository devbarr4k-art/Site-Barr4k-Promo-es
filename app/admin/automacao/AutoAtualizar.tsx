"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Recarrega os dados do painel sozinho (o robô roda a cada minuto na nuvem).
// Só pausa enquanto a pessoa está digitando num campo ou deixou um texto alterado sem salvar.
export function AutoAtualizar({ segundos = 15 }: { segundos?: number }) {
  const router = useRouter();
  const [hora, setHora] = useState("");
  useEffect(() => {
    const alterados = new Set<EventTarget>();
    const marcar = (e: Event) => {
      if (e.target) alterados.add(e.target);
    };
    document.addEventListener("input", marcar);
    const editando = () => {
      const a = document.activeElement as HTMLInputElement | null;
      if (a && /^(TEXTAREA|INPUT|SELECT)$/.test(a.tagName) && a.type !== "hidden" && a.type !== "checkbox") return true;
      for (const el of alterados) if (!(el as Node).isConnected) alterados.delete(el);
      return alterados.size > 0;
    };
    const atualizar = () => {
      if (document.hidden || editando()) return;
      router.refresh();
      setHora(new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    };
    const id = setInterval(atualizar, segundos * 1000);
    const aoVoltar = () => {
      if (!document.hidden) atualizar();
    };
    document.addEventListener("visibilitychange", aoVoltar);
    return () => {
      clearInterval(id);
      document.removeEventListener("input", marcar);
      document.removeEventListener("visibilitychange", aoVoltar);
    };
  }, [router, segundos]);
  return (
    <span className="auto__vivo" title="O painel se atualiza sozinho">
      <i /> atualiza sozinho{hora && ` · ${hora}`}
    </span>
  );
}

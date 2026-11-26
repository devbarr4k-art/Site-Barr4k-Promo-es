"use client";

import { useState } from "react";

// Abas trocam na hora, sem ir ao servidor (o conteúdo das três já vem carregado).
export function Abas({ inicial, abas }: { inicial: string; abas: { id: string; nome: string; conteudo: React.ReactNode }[] }) {
  const [aba, setAba] = useState(inicial);
  const trocar = (id: string) => {
    setAba(id);
    const u = new URL(window.location.href);
    u.searchParams.set("aba", id);
    u.searchParams.delete("ok");
    u.searchParams.delete("erro");
    window.history.replaceState(null, "", u);
  };
  return (
    <>
      <nav className="auto__abas" role="tablist" aria-label="Seções">
        {abas.map((a) => (
          <button key={a.id} type="button" role="tab" aria-selected={a.id === aba} aria-current={a.id === aba ? "page" : undefined} onClick={() => trocar(a.id)}>
            {a.nome}
          </button>
        ))}
      </nav>
      {abas.map((a) => (
        <div key={a.id} role="tabpanel" hidden={a.id !== aba}>
          {a.conteudo}
        </div>
      ))}
    </>
  );
}

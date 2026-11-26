"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Excluir({ id, quem }: { id: string; quem: string }) {
  const router = useRouter();
  const [ocupado, setOcupado] = useState(false);
  return (
    <button
      type="button"
      className="adm__del"
      disabled={ocupado}
      aria-label={`Excluir ${quem}`}
      title="Excluir"
      onClick={async () => {
        if (!confirm(`Excluir ${quem}? Isso não pode ser desfeito.`)) return;
        setOcupado(true);
        const r = await fetch("/api/admin/leads/excluir", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        });
        if (!r.ok) {
          const j = await r.json().catch(() => ({}));
          alert(j.error || "Não deu pra excluir.");
          setOcupado(false);
          return;
        }
        router.refresh();
      }}
    >
      <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
        <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

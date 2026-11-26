"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

// Lixeira de cada linha: abre um popup no visual da ACHOU (não o confirm do navegador).
export default function Excluir({ id, quem }: { id: string; quem: string }) {
  const router = useRouter();
  const [aberto, setAberto] = useState(false);
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState("");
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (aberto && !d.open) d.showModal();
    if (!aberto && d.open) d.close();
  }, [aberto]);

  const excluir = async () => {
    setOcupado(true);
    setErro("");
    const r = await fetch("/api/admin/leads/excluir", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (!r.ok) {
      const j = await r.json().catch(() => ({}));
      setErro(j.error || "Não deu pra excluir. Tente de novo.");
      setOcupado(false);
      return;
    }
    setOcupado(false);
    setAberto(false);
    router.refresh();
  };

  return (
    <>
      <button type="button" className="adm__del" aria-label={`Excluir ${quem}`} title="Excluir" onClick={() => setAberto(true)}>
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
          <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {aberto && createPortal(
      <dialog
        ref={dialog}
        className="gate adm__confirm"
        onClose={() => setAberto(false)}
        onClick={(e) => e.target === dialog.current && !ocupado && setAberto(false)}
      >
        <div className="gate__box">
          <span className="adm__confirm-ico" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="22" height="22">
              <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <h2>Excluir cadastro?</h2>
          <p>
            <b>{quem}</b> vai ser apagado do banco de leads e do CSV. Isso não pode ser desfeito.
          </p>
          {erro && <p className="gate__erro" role="alert">{erro}</p>}
          <div className="adm__confirm-acoes">
            <button type="button" className="adm__btn adm__btn--ghost" onClick={() => setAberto(false)} disabled={ocupado}>
              Cancelar
            </button>
            <button type="button" className="adm__btn adm__btn--perigo" onClick={excluir} disabled={ocupado}>
              {ocupado ? "Excluindo…" : "Excluir"}
            </button>
          </div>
        </div>
      </dialog>,
      document.body,
      )}
    </>
  );
}

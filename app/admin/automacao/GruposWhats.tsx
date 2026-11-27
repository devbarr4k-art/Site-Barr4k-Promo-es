"use client";

import { useState } from "react";
import { addCanal } from "./acoes";

type Grupo = { id: string; nome: string };

// Busca os grupos do WhatsApp do número conectado e deixa adicionar como destino com um clique.
export function GruposWhats({ ligado }: { ligado: boolean }) {
  const [grupos, setGrupos] = useState<Grupo[] | null>(null);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const buscar = async () => {
    setErro("");
    setCarregando(true);
    try {
      const r = await fetch("/api/automacao/grupos-whats");
      const j = await r.json();
      if (!r.ok) throw new Error(j.erro || "Não deu pra buscar.");
      setGrupos(j.grupos as Grupo[]);
    } catch (e) {
      setErro((e as Error).message);
    } finally {
      setCarregando(false);
    }
  };

  if (!ligado) return null;

  return (
    <div className="auto__bloco">
      <h2>Grupos do WhatsApp</h2>
      <p className="auto__ajuda">O número conectado precisa ser administrador do grupo pra postar.</p>
      <button type="button" className="adm__btn adm__btn--ghost" onClick={buscar} disabled={carregando}>
        {carregando ? "Buscando…" : "Buscar meus grupos do WhatsApp"}
      </button>
      {erro && <p className="auto__motivo">{erro}</p>}
      {grupos && grupos.length === 0 && <p className="auto__vazio">Nenhum grupo encontrado nesse número.</p>}
      {grupos && grupos.length > 0 && (
        <ul className="auto__canais" style={{ marginTop: 10 }}>
          {grupos.map((g) => (
            <li key={g.id}>
              <span>{g.nome}</span>
              <form action={addCanal}>
                <input type="hidden" name="chat" value={g.id} />
                <input type="hidden" name="tipo" value="destino" />
                <button className="adm__btn">Postar aqui</button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

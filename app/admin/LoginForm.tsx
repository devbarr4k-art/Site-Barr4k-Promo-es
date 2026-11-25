"use client";

import { useState } from "react";
import { Logo } from "@/components/Logo";

export default function LoginForm() {
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  const entrar = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnviando(true);
    setErro("");
    const r = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: senha }),
    });
    if (r.ok) location.reload();
    else {
      const j = await r.json().catch(() => ({}));
      setErro(j.error || "Não deu pra entrar.");
      setEnviando(false);
    }
  };

  return (
    <main className="adm adm--login">
      <form className="adm__login" onSubmit={entrar}>
        <Logo size={28} />
        <h1>Painel de leads</h1>
        <label className="gate__field">
          <span>Senha</span>
          <input type="password" autoComplete="current-password" value={senha} onChange={(e) => setSenha(e.target.value)} autoFocus />
        </label>
        {erro && <p className="gate__erro" role="alert">{erro}</p>}
        <button className="gate__go" type="submit" disabled={enviando}>
          {enviando ? "Entrando…" : "Entrar"}
        </button>
      </form>
    </main>
  );
}

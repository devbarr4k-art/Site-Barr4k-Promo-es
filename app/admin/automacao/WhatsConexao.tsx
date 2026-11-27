"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Estado = "conectado" | "conectando" | "desligado" | "off" | "...";

// Conectar o WhatsApp direto do painel: mostra o status e o QR code (sem entrar na Evolution).
export function WhatsConexao({ ligado }: { ligado: boolean }) {
  const [status, setStatus] = useState<Estado>(ligado ? "..." : "off");
  const [qr, setQr] = useState<string | null>(null);
  const [erro, setErro] = useState("");
  const [buscandoQr, setBuscandoQr] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const ler = useCallback(async (comQr: boolean) => {
    try {
      const r = await fetch(`/api/automacao/whats${comQr ? "?qr=1" : ""}`);
      const j = await r.json();
      if (!j.ligado) {
        setStatus("off");
        return "off";
      }
      setStatus(j.status);
      if (j.qr) setQr(j.qr);
      if (j.status === "conectado") setQr(null);
      if (j.erro) setErro(j.erro);
      return j.status as Estado;
    } catch {
      return "..." as Estado;
    }
  }, []);

  useEffect(() => {
    // leitura inicial do status (setState acontece depois do fetch, fora do render)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (ligado) void ler(false);
  }, [ligado, ler]);

  // enquanto mostra QR, fica checando se já conectou
  useEffect(() => {
    if (!qr) return;
    timer.current = setInterval(async () => {
      const s = await ler(false);
      if (s === "conectado" && timer.current) clearInterval(timer.current);
    }, 3000);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [qr, ler]);

  const conectar = async () => {
    setErro("");
    setBuscandoQr(true);
    await ler(true);
    setBuscandoQr(false);
  };

  if (!ligado || status === "off") {
    return (
      <div className="auto__bloco">
        <h2>WhatsApp</h2>
        <p className="auto__ajuda">
          Pra postar no WhatsApp, falta ligar a Evolution na Vercel (EVOLUTION_URL, EVOLUTION_KEY e EVOLUTION_INSTANCE). Depois, o QR de
          conexão aparece aqui.
        </p>
      </div>
    );
  }

  return (
    <div className="auto__bloco">
      <h2>WhatsApp</h2>
      <p className="auto__estado">
        {status === "conectado" ? "✓ Número conectado." : status === "conectando" ? "Conectando…" : "Número desconectado."}
      </p>
      {erro && <p className="auto__motivo">{erro}</p>}

      {status === "conectado" ? (
        <p className="auto__ajuda">Tudo certo. Abaixo, escolha em quais grupos o robô posta.</p>
      ) : (
        <>
          {qr ? (
            <div className="auto__qr">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qr} alt="QR code do WhatsApp" width={240} height={240} />
              <p className="auto__ajuda">
                No celular da conta ACHOU: WhatsApp › <b>Aparelhos conectados</b> › <b>Conectar um aparelho</b> e aponte pro QR. Ele some
                sozinho quando conectar.
              </p>
            </div>
          ) : (
            <p className="auto__ajuda">Clique abaixo e leia o QR com o WhatsApp do chip da ACHOU.</p>
          )}
          <button type="button" className="adm__btn" onClick={conectar} disabled={buscandoQr}>
            {buscandoQr ? "Gerando QR…" : qr ? "Gerar outro QR" : "Conectar WhatsApp"}
          </button>
        </>
      )}
    </div>
  );
}

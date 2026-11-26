// Lado do navegador: manda eventos do funil sem travar nada (sendBeacon).
const CHAVE = "achou_v";

export function visitante() {
  try {
    let v = localStorage.getItem(CHAVE);
    if (!v) {
      v = Math.random().toString(36).slice(2) + Date.now().toString(36);
      localStorage.setItem(CHAVE, v);
    }
    return v;
  } catch {
    return null;
  }
}

export function rastrear(t: "visita" | "clique" | "grupo", extra: { c?: string; o?: string; u?: string | null; r?: string } = {}) {
  try {
    const corpo = JSON.stringify({ t, v: visitante(), ...extra });
    const blob = new Blob([corpo], { type: "application/json" });
    if (!navigator.sendBeacon?.("/api/evento", blob)) fetch("/api/evento", { method: "POST", body: corpo, headers: { "content-type": "application/json" }, keepalive: true });
  } catch {}
}

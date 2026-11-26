// Registro anônimo do funil (visita → clique → cadastro → grupo) e dos cliques nas ofertas.
// Nunca guarda IP, nome ou e-mail: só um código aleatório do navegador.
import { db, dbPronto } from "@/lib/automacao/db";

export const TIPOS = ["visita", "clique", "cadastro", "grupo", "oferta"] as const;
export type TipoEvento = (typeof TIPOS)[number];

const ROBO = /bot|crawl|spider|slurp|preview|facebookexternalhit|whatsapp|telegram|vercel|headless|lighthouse|curl|wget|python|node-fetch|axios/i;

export function ehRobo(ua: string | null) {
  return !ua || ROBO.test(ua);
}

export function dispositivo(ua: string | null) {
  return ua && /mobile|android|iphone|ipad/i.test(ua) ? "celular" : "computador";
}

/** "https://www.instagram.com/..." → "instagram" ; utm_source tem prioridade */
export function fonteDe(utm: string | null | undefined, referrer: string | null | undefined) {
  const u = (utm ?? "").trim().toLowerCase().slice(0, 40);
  if (u) return u;
  try {
    const h = new URL(referrer ?? "").hostname.replace(/^(www|m|l|lm)\./, "");
    if (!h || /achou\.io$/.test(h)) return "";
    return h.replace(/\.(com|com\.br|net|org)$/, "").slice(0, 40);
  } catch {
    return "";
  }
}

type Dados = { visitante?: string | null; canal?: string | null; origem?: string | null; fonte?: string | null; dispositivo?: string | null; produto?: string | null };

/** Grava um evento; nunca derruba quem chamou. */
export async function registrar(tipo: TipoEvento, d: Dados = {}) {
  if (!dbPronto()) return;
  const corta = (s: string | null | undefined, n: number) => (s ? String(s).slice(0, n) : null);
  await db()
    .from("site_eventos")
    .insert({
      tipo,
      visitante: corta(d.visitante, 40),
      canal: corta(d.canal, 20),
      origem: corta(d.origem, 40),
      fonte: corta(d.fonte, 40),
      dispositivo: corta(d.dispositivo, 20),
      produto: corta(d.produto, 30),
    })
    .then(
      () => undefined,
      () => undefined,
    );
}

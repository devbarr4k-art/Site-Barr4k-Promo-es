import { NextResponse } from "next/server";
import { dispositivo, ehRobo, fonteDe, registrar } from "@/lib/eventos";

// Recebe visita / clique / grupo do navegador (o cadastro e a oferta são registrados no servidor).
const ACEITOS = new Set(["visita", "clique", "grupo"]);

export async function POST(req: Request) {
  const ua = req.headers.get("user-agent");
  const b = await req.json().catch(() => null);
  if (!b || !ACEITOS.has(b.t) || ehRobo(ua)) return new NextResponse(null, { status: 204 });
  const v = typeof b.v === "string" && /^[a-z0-9]{8,40}$/i.test(b.v) ? b.v : null;
  await registrar(b.t, {
    visitante: v,
    canal: b.c === "whatsapp" ? "whatsapp" : b.c === "telegram" ? "telegram" : null,
    origem: typeof b.o === "string" ? b.o : null,
    fonte: b.t === "visita" ? fonteDe(b.u, b.r) : null,
    dispositivo: dispositivo(ua),
  });
  return new NextResponse(null, { status: 204 });
}

import { NextResponse } from "next/server";
import { isLoggedIn } from "@/lib/auth";
import { listarGruposWhats, whatsLigado } from "@/lib/automacao/whatsapp";

export const dynamic = "force-dynamic";

// Lista os grupos do WhatsApp do número conectado (só pro painel, logado).
export async function GET() {
  if (!(await isLoggedIn())) return NextResponse.json({ erro: "não autorizado" }, { status: 401 });
  if (!whatsLigado()) return NextResponse.json({ erro: "WhatsApp não configurado na Vercel (Evolution)." }, { status: 400 });
  try {
    return NextResponse.json({ grupos: await listarGruposWhats() }, { headers: { "cache-control": "no-store" } });
  } catch (e) {
    return NextResponse.json({ erro: (e as Error).message }, { status: 500 });
  }
}

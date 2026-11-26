import { NextResponse } from "next/server";
import { ciclo } from "@/lib/automacao/ciclo";
import { dbPronto } from "@/lib/automacao/db";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Chamado pelo pg_cron do Supabase a cada minuto. Tem trava interna (no máximo 1 ciclo a cada 40 s).
export async function GET() {
  if (!dbPronto()) return NextResponse.json({ erro: "banco não configurado" }, { status: 503 });
  try {
    return NextResponse.json(await ciclo(), { headers: { "cache-control": "no-store" } });
  } catch (e) {
    return NextResponse.json({ erro: (e as Error).message }, { status: 500 });
  }
}

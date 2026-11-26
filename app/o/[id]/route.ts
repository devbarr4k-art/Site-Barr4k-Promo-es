import { NextResponse } from "next/server";
import { db, lerConfig } from "@/lib/automacao/db";

export const dynamic = "force-dynamic";

// Link curto dos posts: achou.io/o/MLB123 → produto no Mercado Livre com o código de afiliado da ACHOU.
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id.toUpperCase();
  if (!/^MLBU?\d{5,15}$/.test(id)) return NextResponse.redirect("https://www.mercadolivre.com.br", 302);
  const { data } = await db()
    .from("auto_ofertas")
    .select("link_afiliado")
    .like("link_afiliado", `%/${id}?%`)
    .order("criado_em", { ascending: false })
    .limit(1)
    .maybeSingle();
  let destino = data?.link_afiliado as string | undefined;
  if (!destino) {
    // oferta já apagada (limpeza de 30 dias): monta o link do produto com o código de afiliado
    const cfg = await lerConfig().catch(() => null);
    const u = new URL(`https://www.mercadolivre.com.br/${id.startsWith("MLBU") ? "up" : "p"}/${id}`);
    if (cfg?.ml_matt_tool) u.searchParams.set("matt_tool", cfg.ml_matt_tool);
    if (cfg?.ml_matt_word) u.searchParams.set("matt_word", cfg.ml_matt_word);
    destino = u.toString();
  }
  return NextResponse.redirect(destino, { status: 302, headers: { "cache-control": "no-store" } });
}

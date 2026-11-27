import { NextResponse } from "next/server";
import { db, lerConfig } from "@/lib/automacao/db";
import { dispositivo, ehRobo, registrar } from "@/lib/eventos";
import { codigoProduto } from "@/lib/automacao/curto";

export const dynamic = "force-dynamic";

// Link curto dos posts: achou.io/o/MLB123 → produto no Mercado Livre com o código de afiliado da ACHOU.
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id.toUpperCase();
  if (!/^MLBU?\d{5,15}$/.test(id)) return NextResponse.redirect("https://www.mercadolivre.com.br", 302);
  const ua = req.headers.get("user-agent");
  // conta o clique (robôs de pré-visualização do Telegram/WhatsApp não contam)
  if (!ehRobo(ua)) await registrar("oferta", { produto: id, dispositivo: dispositivo(ua) });
  // a oferta mais recente cujo link tem exatamente esse código (variação, anúncio ou produto)
  const { data: ofertas } = await db()
    .from("auto_ofertas")
    .select("link_afiliado")
    .ilike("link_afiliado", `%${id.slice(3)}%`)
    .order("criado_em", { ascending: false })
    .limit(20);
  let destino = (ofertas ?? []).map((o) => o.link_afiliado as string).find((l) => codigoProduto(l) === id);
  if (!destino) {
    // oferta já apagada (limpeza de 30 dias): monta o link do produto com o código de afiliado
    const cfg = await lerConfig().catch(() => null);
    const num = id.replace(/^MLBU?/, "");
    const u = new URL(
      id.startsWith("MLBU")
        ? `https://www.mercadolivre.com.br/up/${id}`
        : num.length >= 10
          ? `https://produto.mercadolivre.com.br/MLB-${num}`
          : `https://www.mercadolivre.com.br/p/${id}`,
    );
    if (cfg?.ml_matt_tool) u.searchParams.set("matt_tool", cfg.ml_matt_tool);
    if (cfg?.ml_matt_word) u.searchParams.set("matt_word", cfg.ml_matt_word);
    destino = u.toString();
  }
  return NextResponse.redirect(destino, { status: 302, headers: { "cache-control": "no-store" } });
}

import { NextResponse } from "next/server";
import { db, dbPronto } from "@/lib/automacao/db";
import { gerarMeli } from "@/lib/automacao/meli";

export const dynamic = "force-dynamic";

// A extensão da ACHOU envia aqui a sessão do Mercado Livre do dono (cookies), pra gerar meli.la.
// Protegido pelo token que aparece no painel (achou.io/admin › Automação › Configurar).
const cors = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "content-type",
  "access-control-allow-methods": "POST, OPTIONS",
};

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: cors });
}

export async function POST(req: Request) {
  if (!dbPronto()) return NextResponse.json({ erro: "banco não configurado" }, { status: 503, headers: cors });
  const b = (await req.json().catch(() => null)) as { token?: string; cookies?: string } | null;
  const token = (b?.token ?? "").trim();
  const cookies = (b?.cookies ?? "").trim();
  if (!token || !cookies) return NextResponse.json({ ok: false, erro: "Faltou o token ou a sessão." }, { status: 400, headers: cors });

  const { data } = await db().from("auto_config").select("extensao_token, ml_matt_word").eq("id", 1).maybeSingle();
  const cfg = data as { extensao_token?: string; ml_matt_word?: string } | null;
  if (!cfg?.extensao_token || token !== cfg.extensao_token) {
    return NextResponse.json({ ok: false, erro: "Token inválido. Copie o token do painel de novo." }, { status: 401, headers: cors });
  }
  if (!cfg.ml_matt_word) {
    return NextResponse.json({ ok: false, erro: "Configure antes o link de afiliado do Mercado Livre no painel." }, { status: 400, headers: cors });
  }

  // confere a sessão gerando um link de teste
  const teste = await gerarMeli("https://www.mercadolivre.com.br/p/MLB25943491", cookies, cfg.ml_matt_word);
  if ("erro" in teste) {
    return NextResponse.json({ ok: false, erro: teste.erro }, { status: 400, headers: cors });
  }
  await db().from("auto_config").update({ ml_cookies: cookies, ml_sessao_em: new Date().toISOString(), ml_sessao_erro: null }).eq("id", 1);
  return NextResponse.json({ ok: true, exemplo: teste.link }, { headers: cors });
}

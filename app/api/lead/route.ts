import { NextResponse } from "next/server";
import { blobPronto, limparEmail, limparNome, limparTelefone, salvarLead, type Canal } from "@/lib/leads";
import { LINKS } from "@/lib/config";
import { dispositivo, registrar } from "@/lib/eventos";

// Recebe o cadastro e só então devolve o link do grupo (o link não fica no HTML da página).
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  if (body.site) return NextResponse.json({ ok: true, url: "/" }); // campo isca contra robô

  const nome = limparNome(body.nome);
  const email = limparEmail(body.email);
  const telefone = limparTelefone(body.telefone);
  const canal: Canal = body.canal === "whatsapp" ? "whatsapp" : "telegram";
  if (!nome) return NextResponse.json({ error: "Diz seu nome." }, { status: 400 });
  if (!email) return NextResponse.json({ error: "Confira o e-mail." }, { status: 400 });
  if (!telefone) return NextResponse.json({ error: "Confira o telefone, com DDD." }, { status: 400 });
  if (body.consentimento !== true) {
    return NextResponse.json({ error: "Marque que você concorda em receber as ofertas." }, { status: 400 });
  }

  try {
    await salvarLead({
      nome,
      email,
      telefone,
      canal,
      em: new Date().toISOString(),
      origem: typeof body.origem === "string" ? body.origem.slice(0, 40) : "",
    });
  } catch (e) {
    console.error("[lead] falha ao salvar", e);
    // Enquanto o Blob privado não estiver ligado na Vercel, não trava a entrada no grupo.
    if (!blobPronto()) console.error("[lead] BLOB_READ_WRITE_TOKEN ausente: lead NÃO foi salvo", { canal });
    else return NextResponse.json({ error: "Não deu pra salvar agora. Tente de novo em instantes." }, { status: 500 });
  }

  await registrar("cadastro", {
    visitante: typeof body.v === "string" && /^[a-z0-9]{8,40}$/i.test(body.v) ? body.v : null,
    canal,
    origem: typeof body.origem === "string" ? body.origem : null,
    dispositivo: dispositivo(req.headers.get("user-agent")),
  });

  const url = canal === "whatsapp" ? process.env.WHATSAPP_URL || LINKS.whatsapp : process.env.TELEGRAM_URL || LINKS.telegram;
  return NextResponse.json({ ok: true, url });
}

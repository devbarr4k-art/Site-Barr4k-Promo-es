import { NextResponse } from "next/server";
import { limparEmail } from "@/lib/leads";
import { limparInteresses, salvarInteresses } from "@/lib/interesses";

// Etapa opcional depois do cadastro: a pessoa escolhe as categorias que quer receber.
export async function POST(req: Request) {
  const b = await req.json().catch(() => ({}));
  const email = limparEmail(b.email);
  const interesses = limparInteresses(b.interesses);
  if (!email) return NextResponse.json({ error: "Cadastro não encontrado." }, { status: 400 });
  if (!interesses.length) return NextResponse.json({ error: "Escolha pelo menos uma categoria." }, { status: 400 });
  try {
    await salvarInteresses(email, interesses);
  } catch (e) {
    console.error("[interesses]", e);
    return NextResponse.json({ error: "Não deu pra salvar agora. Tente de novo." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

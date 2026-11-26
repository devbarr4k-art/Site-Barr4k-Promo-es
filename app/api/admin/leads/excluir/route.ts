import { NextResponse } from "next/server";
import { isLoggedIn } from "@/lib/auth";
import { excluirLead } from "@/lib/leads";

export async function POST(req: Request) {
  if (!(await isLoggedIn())) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const { id } = await req.json().catch(() => ({ id: "" }));
  try {
    await excluirLead(String(id ?? ""));
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message || "Não deu pra excluir." }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}

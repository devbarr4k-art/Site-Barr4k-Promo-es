import { NextResponse } from "next/server";
import { isLoggedIn } from "@/lib/auth";
import { qrWhats, statusWhats, whatsLigado } from "@/lib/automacao/whatsapp";

export const dynamic = "force-dynamic";

// Status da conexão do WhatsApp e, se preciso, o QR code — pra conectar dentro do painel.
export async function GET(req: Request) {
  if (!(await isLoggedIn())) return NextResponse.json({ erro: "não autorizado" }, { status: 401 });
  if (!whatsLigado()) return NextResponse.json({ ligado: false }, { headers: { "cache-control": "no-store" } });
  const status = await statusWhats();
  const querQr = new URL(req.url).searchParams.get("qr") === "1";
  const qr = status !== "conectado" && querQr ? await qrWhats() : null;
  return NextResponse.json({ ligado: true, status, qr: qr?.qr ?? null, erro: qr?.erro ?? null }, { headers: { "cache-control": "no-store" } });
}

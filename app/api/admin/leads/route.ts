import { isLoggedIn } from "@/lib/auth";
import { listarLeads } from "@/lib/leads";
import { lerInteresses, nomeCategoria } from "@/lib/interesses";

// Exporta todos os leads em CSV (abre direto no Excel/Google Planilhas).
export async function GET() {
  if (!(await isLoggedIn())) return new Response("Não autorizado", { status: 401 });
  const [leads, mapa] = await Promise.all([listarLeads(), lerInteresses().catch(() => new Map<string, string[]>())]);
  const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const linhas = [
    "data;nome;email;telefone;canal;interesses;origem",
    ...leads.map((l) =>
      [new Date(l.em).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" }), l.nome, l.email, "+" + l.telefone, (l.canais ?? [l.canal]).join(" + "), (mapa.get(l.email) ?? []).map(nomeCategoria).join(", "), l.origem]
        .map(esc)
        .join(";"),
    ),
  ];
  const nome = `leads-achou-${new Date().toISOString().slice(0, 10)}.csv`;
  return new Response("﻿" + linhas.join("\r\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${nome}"`,
      "Cache-Control": "no-store",
    },
  });
}

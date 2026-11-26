import { isLoggedIn } from "@/lib/auth";
import { listarLeads } from "@/lib/leads";

// Exporta todos os leads em CSV (abre direto no Excel/Google Planilhas).
export async function GET() {
  if (!(await isLoggedIn())) return new Response("Não autorizado", { status: 401 });
  const leads = await listarLeads();
  const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const linhas = [
    "data;nome;email;telefone;canal;origem",
    ...leads.map((l) =>
      [new Date(l.em).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" }), l.nome, l.email, "+" + l.telefone, l.canal, l.origem]
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

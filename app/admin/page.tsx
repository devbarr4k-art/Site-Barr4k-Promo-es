import type { Metadata } from "next";
import { isLoggedIn } from "@/lib/auth";
import { blobPronto, listarLeads } from "@/lib/leads";
import { Logo } from "@/components/Logo";
import LoginForm from "./LoginForm";
import Sair from "./Sair";
import Excluir from "./Excluir";
import { Paginacao } from "./Paginacao";
import { Funil } from "./Funil";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Leads · ACHOU", robots: { index: false, follow: false } };

const POR_PAGINA = 20;
const fmtData = (iso: string) =>
  new Date(iso).toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
const fmtTel = (t: string) => {
  const d = t.replace(/^55/, "");
  return d.length === 11 ? `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}` : `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
};

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; p?: string; canal?: string; f?: string }>;
}) {
  if (!(await isLoggedIn())) return <LoginForm />;

  const sp = await searchParams;
  const q = (sp.q ?? "").trim().toLowerCase();
  const canal = sp.canal === "telegram" || sp.canal === "whatsapp" ? sp.canal : "";
  const todos = await listarLeads();

  const hoje = new Date().toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });
  const deHoje = todos.filter((l) => new Date(l.em).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" }) === hoje).length;
  const tg = todos.filter((l) => l.canais?.includes("telegram")).length;
  const wa = todos.filter((l) => l.canais?.includes("whatsapp")).length;

  const qDigitos = q.replace(/\D/g, "");
  const filtrados = todos.filter(
    (l) => (!canal || !!l.canais?.includes(canal)) && (!q || l.email.includes(q) || l.nome.toLowerCase().includes(q) || (qDigitos.length >= 3 && l.telefone.includes(qDigitos))),
  );
  const paginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA));
  const pagina = Math.min(paginas, Math.max(1, Number(sp.p) || 1));
  const lista = filtrados.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);

  const link = (p: number) => {
    const u = new URLSearchParams();
    if (q) u.set("q", q);
    if (canal) u.set("canal", canal);
    if (p > 1) u.set("p", String(p));
    const s = u.toString();
    return s ? `/admin?${s}` : "/admin";
  };

  return (
    <main className="adm">
      <header className="adm__top">
        <Logo size={24} />
        <nav className="auto__nav" aria-label="Painel">
          <a href="/admin" aria-current="page">Leads</a>
          <a href="/admin/automacao">Automação</a>
        </nav>
        <div className="adm__actions">
          <a className="adm__btn" href="/api/admin/leads">Exportar CSV</a>
          <Sair />
        </div>
      </header>

      {!blobPronto() && (
        <p className="adm__aviso">
          Banco de leads não conectado: falta ligar um Blob <b>privado</b> ao projeto na Vercel. No PC os leads ficam só num
          arquivo temporário.
        </p>
      )}

      <section className="adm__stats">
        <div><b>{todos.length.toLocaleString("pt-BR")}</b><span>leads no total</span></div>
        <div><b>{deHoje.toLocaleString("pt-BR")}</b><span>hoje</span></div>
        <div><b>{tg.toLocaleString("pt-BR")}</b><span>Telegram</span></div>
        <div><b>{wa.toLocaleString("pt-BR")}</b><span>WhatsApp</span></div>
      </section>

      <Funil periodo={sp.f ?? "7"} />

      <form className="adm__filtros" action="/admin">
        <input name="q" defaultValue={q} placeholder="Buscar por nome, e-mail ou telefone" aria-label="Buscar" />
        <select name="canal" defaultValue={canal} aria-label="Canal">
          <option value="">Todos os canais</option>
          <option value="telegram">Telegram</option>
          <option value="whatsapp">WhatsApp</option>
        </select>
        <button className="adm__btn" type="submit">Filtrar</button>
      </form>

      <div className="adm__tabela">
        <table>
          <thead>
            <tr>
              <th>Data</th>
              <th>Nome</th>
              <th>E-mail</th>
              <th>Telefone</th>
              <th>Canal</th>
              <th>Botão</th>
              <th aria-label="Ações"></th>
            </tr>
          </thead>
          <tbody>
            {lista.map((l, i) => (
              <tr key={l.em + i}>
                <td>{fmtData(l.em)}</td>
                <td>{l.nome || "—"}</td>
                <td><a href={`mailto:${l.email}`}>{l.email}</a></td>
                <td><a href={`https://wa.me/${l.telefone}`} target="_blank" rel="noopener">{fmtTel(l.telefone)}</a></td>
                <td><div className="adm__canais">
                  {(l.canais ?? [l.canal]).map((c) => (
                    <span key={c} className={`adm__tag adm__tag--${c}`}>{c === "telegram" ? "Telegram" : "WhatsApp"}</span>
                  ))}
                </div></td>
                <td className="adm__muted">{l.origem || "—"}</td>
                <td>{l.id && <Excluir id={l.id} quem={l.nome || l.email} />}</td>
              </tr>
            ))}
            {lista.length === 0 && (
              <tr>
                <td colSpan={7} className="adm__vazio">
                  {todos.length === 0
                    ? "Nenhum lead ainda. Assim que alguém se cadastrar no site, aparece aqui."
                    : "Nada encontrado com esse filtro."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Paginacao pagina={pagina} paginas={paginas} total={filtrados.length} link={link} />
    </main>
  );
}

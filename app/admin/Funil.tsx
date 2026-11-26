import { db, dbPronto } from "@/lib/automacao/db";

// Funil do site: visitaram → clicaram em entrar → cadastraram → abriram o grupo.
// Conta pessoas únicas (código anônimo do navegador). Dados de supabase/funil.sql.

const PERIODOS = [
  ["hoje", "Hoje"],
  ["7", "7 dias"],
  ["30", "30 dias"],
] as const;

function inicio(p: string) {
  const hojeSP = new Date().toLocaleDateString("sv-SE", { timeZone: "America/Sao_Paulo" }); // AAAA-MM-DD
  const meiaNoite = new Date(`${hojeSP}T00:00:00-03:00`);
  const dias = p === "30" ? 29 : p === "7" ? 6 : 0;
  return new Date(meiaNoite.getTime() - dias * 86_400_000);
}

const n = (x: number) => x.toLocaleString("pt-BR");
const pct = (a: number, b: number) => (b ? `${Math.round((a / b) * 1000) / 10}%` : "—");

export async function Funil({ periodo }: { periodo: string }) {
  const p = PERIODOS.some(([k]) => k === periodo) ? periodo : "7";
  const desde = inicio(p).toISOString();

  const topo = (
    <div className="fun__topo">
      <h2>Funil do site</h2>
      <nav className="auto__filtros" aria-label="Período">
        {PERIODOS.map(([k, nome]) => (
          <a key={k} href={`/admin?f=${k}`} aria-current={k === p ? "page" : undefined}>
            {nome}
          </a>
        ))}
      </nav>
    </div>
  );

  if (!dbPronto()) return null;
  const [tot, fon, dia] = await Promise.all([
    db().rpc("funil_totais", { desde }),
    db().rpc("funil_fontes", { desde }),
    db().rpc("funil_dias", { desde }),
  ]);
  if (tot.error) {
    return (
      <section className="fun">
        {topo}
        <p className="adm__aviso">
          Falta ligar o contador: rode o arquivo <b>supabase/funil.sql</b> no SQL Editor do Supabase.
        </p>
      </section>
    );
  }

  const t = Object.fromEntries((tot.data as { tipo: string; total: number; unicos: number }[]).map((r) => [r.tipo, r]));
  const u = (k: string) => Number(t[k]?.unicos ?? 0);
  const visitas = u("visita");
  const etapas = [
    { nome: "Visitaram o site", v: visitas },
    { nome: "Clicaram em entrar", v: u("clique") },
    { nome: "Fizeram o cadastro", v: u("cadastro") },
    { nome: "Abriram o grupo", v: u("grupo") },
  ];
  const fontes = (fon.data ?? []) as { fonte: string; unicos: number }[];
  const porDia = new Map<string, number>();
  for (const r of (dia.data ?? []) as { dia: string; tipo: string; unicos: number }[]) if (r.tipo === "visita") porDia.set(r.dia, Number(r.unicos));
  const dias = [...porDia.entries()];
  const maxDia = Math.max(1, ...dias.map(([, v]) => v));

  return (
    <section className="fun">
      {topo}

      <ol className="fun__etapas">
        {etapas.map((e, i) => (
          <li key={e.nome}>
            <div className="fun__linha">
              <span className="fun__nome">
                <i>{i + 1}</i> {e.nome}
              </span>
              <b>{n(e.v)}</b>
            </div>
            <div className="fun__barra">
              <span style={{ width: `${visitas ? Math.max(2, (e.v / visitas) * 100) : 0}%` }} />
            </div>
            {i > 0 && (
              <small>
                {pct(e.v, etapas[i - 1].v)} da etapa anterior · {pct(e.v, visitas)} de quem visitou
              </small>
            )}
          </li>
        ))}
      </ol>

      <div className="fun__cards">
        <div className="fun__card">
          <span>Cliques nas ofertas do canal</span>
          <b>{n(Number(t.oferta?.total ?? 0))}</b>
          <small>links achou.io/o/… abertos</small>
        </div>
        <div className="fun__card">
          <span>De onde vêm as visitas</span>
          {fontes.length ? (
            <ul>
              {fontes.map((f) => (
                <li key={f.fonte}>
                  <em>{f.fonte}</em>
                  <b>{n(Number(f.unicos))}</b>
                </li>
              ))}
            </ul>
          ) : (
            <small>sem visitas no período</small>
          )}
        </div>
        {p !== "hoje" && (
          <div className="fun__card">
            <span>Visitas por dia</span>
            <div className="fun__dias">
              {dias.map(([d, v]) => (
                <div key={d} title={`${d.split("-").reverse().slice(0, 2).join("/")}: ${v}`}>
                  <span style={{ height: `${(v / maxDia) * 100}%` }} />
                </div>
              ))}
            </div>
            {!dias.length && <small>sem visitas no período</small>}
          </div>
        )}
      </div>
    </section>
  );
}

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

  const vazio = etapas.every((e) => e.v === 0);
  const nomePeriodo = PERIODOS.find(([k]) => k === p)?.[1].toLowerCase();

  return (
    <section className="fun">
      {topo}
      <p className="fun__sub">Pessoas únicas · {nomePeriodo}</p>

      <ol className="fun__passos">
        {etapas.map((e, i) => (
          <li key={e.nome} className={`fun__passo ${vazio ? "is-vazio" : ""}`}>
            {i > 0 && <span className="fun__conv">{pct(e.v, etapas[i - 1].v)}</span>}
            <span className="fun__rot">
              <i>{i + 1}</i>
              {e.nome}
            </span>
            <b>{n(e.v)}</b>
            <div className="fun__coluna">
              <span style={{ height: `${visitas ? Math.max(6, (e.v / visitas) * 100) : 100 - i * 22}%` }} />
            </div>
            <small>{i === 0 ? "base do funil" : `${pct(e.v, visitas)} do total`}</small>
          </li>
        ))}
      </ol>
      {vazio && (
        <p className="fun__vazio">
          O contador começou agora. Visitas, cliques e cadastros aparecem aqui conforme as pessoas entram no site.
        </p>
      )}

      <div className="fun__cards">
        <div className="fun__card">
          <span>Cliques nas ofertas</span>
          <b>{n(Number(t.oferta?.total ?? 0))}</b>
          <small>links achou.io/o/ abertos no canal</small>
        </div>
        <div className="fun__card">
          <span>De onde vêm</span>
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
            <small>aparece quando chegarem visitas</small>
          )}
        </div>
        <div className="fun__card">
          <span>Visitas por dia</span>
          {dias.length ? (
            <div className="fun__dias">
              {dias.map(([d, v]) => (
                <div key={d} title={`${d.split("-").reverse().slice(0, 2).join("/")}: ${v}`}>
                  <span style={{ height: `${(v / maxDia) * 100}%` }} />
                </div>
              ))}
            </div>
          ) : (
            <small>aparece quando chegarem visitas</small>
          )}
        </div>
      </div>
    </section>
  );
}

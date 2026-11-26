import Link from "next/link";

// Paginação do painel: ← Anterior · 1 2 3 … 9 · Próxima →, sempre visível.
export function Paginacao({ pagina, paginas, total, link }: { pagina: number; paginas: number; total?: number; link: (p: number) => string }) {
  const nums: (number | "…")[] = [];
  for (let p = 1; p <= paginas; p++) {
    if (p === 1 || p === paginas || Math.abs(p - pagina) <= 1) nums.push(p);
    else if (nums[nums.length - 1] !== "…") nums.push("…");
  }
  return (
    <nav className="pag" aria-label="Páginas">
      <span className="pag__info">
        {total !== undefined && `${total.toLocaleString("pt-BR")} ${total === 1 ? "item" : "itens"} · `}página {pagina} de {paginas}
      </span>
      <div className="pag__botoes">
        {pagina > 1 ? (
          <Link className="pag__b" href={link(pagina - 1)} aria-label="Página anterior">
            ← <span className="pag__txt">Anterior</span>
          </Link>
        ) : (
          <span className="pag__b is-off" aria-hidden>
            ← <span className="pag__txt">Anterior</span>
          </span>
        )}
        {nums.map((n, i) =>
          n === "…" ? (
            <span key={`r${i}`} className="pag__reti">…</span>
          ) : (
            <Link key={n} className="pag__b pag__n" href={link(n)} aria-current={n === pagina ? "page" : undefined}>
              {n}
            </Link>
          ),
        )}
        {pagina < paginas ? (
          <Link className="pag__b" href={link(pagina + 1)} aria-label="Próxima página">
            <span className="pag__txt">Próxima</span> →
          </Link>
        ) : (
          <span className="pag__b is-off" aria-hidden>
            <span className="pag__txt">Próxima</span> →
          </span>
        )}
      </div>
    </nav>
  );
}

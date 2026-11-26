-- Funil do site (visitas → cliques → cadastros → grupo) e cliques nas ofertas.
-- Rode uma vez no SQL Editor do Supabase. Pode rodar de novo sem problema.
-- Anônimo: guarda só um código aleatório do navegador, nunca IP, nome ou e-mail.

create table if not exists site_eventos (
  id bigint generated always as identity primary key,
  em timestamptz not null default now(),
  tipo text not null check (tipo in ('visita', 'clique', 'cadastro', 'grupo', 'oferta')),
  visitante text,
  canal text,
  origem text,
  fonte text,
  dispositivo text,
  produto text
);
create index if not exists site_eventos_em on site_eventos (em desc);
create index if not exists site_eventos_tipo_em on site_eventos (tipo, em desc);

alter table site_eventos enable row level security;
grant all on site_eventos to service_role;

-- totais por etapa (eventos e pessoas únicas)
create or replace function funil_totais(desde timestamptz)
returns table (tipo text, total bigint, unicos bigint)
language sql stable as $$
  select tipo, count(*), count(distinct coalesce(visitante, id::text))
  from site_eventos where em >= desde group by tipo
$$;

-- de onde vêm as visitas
create or replace function funil_fontes(desde timestamptz)
returns table (fonte text, unicos bigint)
language sql stable as $$
  select coalesce(nullif(fonte, ''), 'direto'), count(distinct coalesce(visitante, id::text))
  from site_eventos where em >= desde and tipo = 'visita'
  group by 1 order by 2 desc limit 8
$$;

-- por dia (horário de Brasília)
create or replace function funil_dias(desde timestamptz)
returns table (dia date, tipo text, unicos bigint)
language sql stable as $$
  select (em at time zone 'America/Sao_Paulo')::date, tipo, count(distinct coalesce(visitante, id::text))
  from site_eventos where em >= desde group by 1, 2 order by 1
$$;

-- só o servidor (service role) lê
revoke execute on function funil_totais(timestamptz), funil_fontes(timestamptz), funil_dias(timestamptz) from public, anon, authenticated;
grant execute on function funil_totais(timestamptz), funil_fontes(timestamptz), funil_dias(timestamptz) to service_role;

-- limpeza: eventos com mais de 1 ano
select cron.schedule('achou-eventos-limpeza', '30 4 * * *', $$delete from site_eventos where em < now() - interval '365 days'$$);

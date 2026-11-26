-- ACHOU · Automação de ofertas (fica no mesmo projeto Supabase). Rode no SQL Editor. Idempotente.
-- O achou.io acessa com a service role; o robô roda sozinho: o pg_cron chama o achou.io a cada minuto.

create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Configuração (uma linha só, id = 1)
create table if not exists public.auto_config (
  id smallint primary key default 1 check (id = 1),
  ativo boolean not null default false,
  aprovacao_manual boolean not null default true,
  bot_token text not null default '',
  ml_matt_tool text not null default '',
  ml_matt_word text not null default '',
  hora_inicio smallint not null default 8,
  hora_fim smallint not null default 23,
  intervalo_min smallint not null default 20,
  intervalo_max smallint not null default 45,
  palavras_bloqueadas text[] not null default '{}',
  template text not null default '',
  ultimo_ciclo timestamptz,
  proximo_envio timestamptz,
  ultimo_erro text
);
insert into public.auto_config (id) values (1) on conflict do nothing;

-- Canais: origem (lê) e destino (posta)
create table if not exists public.auto_grupos (
  id uuid primary key default gen_random_uuid(),
  tipo text not null check (tipo in ('origem', 'destino')),
  chat text not null,
  ativo boolean not null default true,
  ultimo_post bigint not null default 0,
  criado_em timestamptz not null default now()
);

-- Fila
create table if not exists public.auto_ofertas (
  id uuid primary key default gen_random_uuid(),
  origem text,
  origem_post text,
  texto_original text not null default '',
  texto_final text not null default '',
  link_original text,
  link_afiliado text,
  status text not null default 'pendente' check (status in ('pendente', 'aprovada', 'enviada', 'descartada', 'erro')),
  motivo text,
  criado_em timestamptz not null default now(),
  enviado_em timestamptz
);
create index if not exists auto_ofertas_fila on public.auto_ofertas(status, criado_em);
create unique index if not exists auto_ofertas_post on public.auto_ofertas(origem_post) where origem_post is not null;

-- Só a service role mexe (o navegador nunca acessa direto)
alter table public.auto_config enable row level security;
alter table public.auto_grupos enable row level security;
alter table public.auto_ofertas enable row level security;
grant all on public.auto_config, public.auto_grupos, public.auto_ofertas to service_role;

-- Robô: chama o achou.io a cada minuto
select cron.unschedule('achou-ciclo') where exists (select 1 from cron.job where jobname = 'achou-ciclo');
select cron.schedule('achou-ciclo', '* * * * *', $$ select net.http_get('https://www.achou.io/api/automacao/ciclo', timeout_milliseconds := 55000) $$);

-- Limpeza: tira da fila o que tem mais de 30 dias (o banco grátis tem 500 MB)
select cron.unschedule('achou-limpeza') where exists (select 1 from cron.job where jobname = 'achou-limpeza');
select cron.schedule('achou-limpeza', '0 4 * * *', $$ delete from public.auto_ofertas where criado_em < now() - interval '30 days' $$);

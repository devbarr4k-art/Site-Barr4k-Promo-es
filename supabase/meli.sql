-- Sessão do Mercado Livre que a extensão da ACHOU envia (pra gerar meli.la na conta do dono).
-- Rode uma vez no SQL Editor do Supabase. Pode rodar de novo sem problema.
alter table auto_config add column if not exists ml_cookies text;        -- cookies da sessão (só o servidor lê)
alter table auto_config add column if not exists ml_sessao_em timestamptz; -- quando a extensão enviou
alter table auto_config add column if not exists ml_sessao_erro text;      -- último erro (ex.: sessão expirou)
alter table auto_config add column if not exists extensao_token text;      -- token que a extensão usa pra conectar

-- cria um token aleatório pra extensão, se ainda não tiver
update auto_config set extensao_token = encode(gen_random_bytes(16), 'hex') where id = 1 and (extensao_token is null or extensao_token = '');

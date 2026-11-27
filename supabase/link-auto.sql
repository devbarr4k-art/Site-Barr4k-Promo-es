-- Botão "Link automático": liga/desliga a geração automática do meli.la.
-- Desligado (padrão), as ofertas saem com o link achou.io e você gera o meli.la só no que quiser.
alter table auto_config add column if not exists link_automatico boolean not null default false;

// Um ciclo do robô: captura posts novos dos canais de origem e posta a próxima oferta aprovada.
// Quem chama: pg_cron do Supabase, a cada minuto (ver supabase/automacao.sql).
import { db, lerConfig, type Config } from "./db";
import { dentroDoHorario, proximoIntervalo } from "./agenda";
import { lerCanal, postar, postarFoto } from "./telegram";
import { fotoComMarca, infoDoTexto } from "./imagem";
import { processar } from "./oferta";
import { ehLinkML, lerProduto } from "./ml";

const POR_CANAL = 6; // posts novos processados por canal a cada minuto

export async function capturar(cfg: Config) {
  const { data: origens } = await db().from("auto_grupos").select("*").eq("tipo", "origem").eq("ativo", true);
  const log: string[] = [];
  for (const g of origens ?? []) {
    try {
      const posts = await lerCanal(g.chat);
      const novos = posts.filter((p) => p.id > g.ultimo_post);
      // primeira vez: não puxa o histórico inteiro, só os 2 últimos
      const fila = (g.ultimo_post ? novos : novos.slice(-2)).slice(0, POR_CANAL);
      for (const p of fila) {
        const temML = [...p.links, p.texto].some((x) => /meli\.la|mercadoli[vb]re\.com/i.test(x));
        if (!temML) continue;
        const r = await processar(p.texto, p.links.filter(ehLinkML), cfg);
        await db()
          .from("auto_ofertas")
          .insert({
            origem: g.chat,
            origem_post: p.chave,
            texto_original: p.texto,
            texto_final: r.ok ? r.texto : "",
            link_original: r.linkOriginal ?? null,
            link_afiliado: r.ok ? r.linkAfiliado : null,
            status: r.ok ? (cfg.aprovacao_manual ? "pendente" : "aprovada") : "erro",
            motivo: r.ok ? null : r.motivo,
          });
        log.push(`${p.chave}: ${r.ok ? "ok" : r.motivo}`);
      }
      const maior = fila.length ? fila[fila.length - 1].id : posts.length && !g.ultimo_post ? posts[posts.length - 1].id : g.ultimo_post;
      if (maior > g.ultimo_post) await db().from("auto_grupos").update({ ultimo_post: maior }).eq("id", g.id);
    } catch (e) {
      log.push(`${g.chat}: ${(e as Error).message}`);
    }
  }
  return log;
}

export async function disparar(cfg: Config, forcar = false) {
  if (!forcar) {
    if (!cfg.ativo) return "disparo desligado";
    if (!dentroDoHorario(cfg)) return "fora do horário";
    if (cfg.proximo_envio && new Date(cfg.proximo_envio) > new Date()) return "aguardando intervalo";
  }
  if (!cfg.bot_token) return "falta o token do bot";
  const { data: oferta } = await db()
    .from("auto_ofertas")
    .select("id, texto_final, link_original")
    .eq("status", "aprovada")
    .order("criado_em")
    .limit(1)
    .maybeSingle();
  if (!oferta) return "fila vazia";
  const { data: destinos } = await db().from("auto_grupos").select("chat").eq("tipo", "destino").eq("ativo", true);
  if (!destinos?.length) return "nenhum canal de destino";

  const erros: string[] = [];
  let enviou = false;
  // foto do produto (a vitrine do link original tem a imagem); sem foto, vai só o texto
  const foto = oferta.link_original ? await lerProduto(oferta.link_original).then((p) => p?.imagem ?? null).catch(() => null) : null;
  const info = infoDoTexto(oferta.texto_final);
  for (const d of destinos) {
    try {
      const png = foto ? await fotoComMarca(foto, d.chat, info).catch(() => null) : null;
      if (png) await postarFoto(cfg.bot_token, d.chat, png, oferta.texto_final);
      else await postar(cfg.bot_token, d.chat, oferta.texto_final);
      enviou = true;
    } catch (e) {
      erros.push(`${d.chat}: ${(e as Error).message}`);
    }
  }
  const agora = new Date();
  await db()
    .from("auto_ofertas")
    .update(
      enviou
        ? { status: "enviada", enviado_em: agora.toISOString(), motivo: erros.join(" · ") || null }
        : { status: "erro", motivo: erros.join(" · ") },
    )
    .eq("id", oferta.id);
  await db()
    .from("auto_config")
    .update({
      proximo_envio: new Date(agora.getTime() + proximoIntervalo(cfg)).toISOString(),
      ultimo_erro: erros.length ? erros.join(" · ") : null,
    })
    .eq("id", 1);
  return enviou ? "enviada" : `erro: ${erros.join(" · ")}`;
}

/** Ciclo completo, com trava: no máximo um a cada 40 s, mesmo se chamarem várias vezes. */
export async function ciclo() {
  const limite = new Date(Date.now() - 40_000).toISOString();
  const { data: pegou } = await db()
    .from("auto_config")
    .update({ ultimo_ciclo: new Date().toISOString() })
    .eq("id", 1)
    .or(`ultimo_ciclo.is.null,ultimo_ciclo.lt.${limite}`)
    .select("id");
  if (!pegou?.length) return { pulou: true };
  const cfg = await lerConfig();
  const captura = await capturar(cfg);
  const disparo = await disparar(cfg);
  return { captura, disparo };
}

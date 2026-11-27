// Um ciclo do robô: captura posts novos dos canais de origem e posta a próxima oferta aprovada.
// Quem chama: pg_cron do Supabase, a cada minuto (ver supabase/automacao.sql).
import { db, inserirOferta, lerConfig, type Config } from "./db";
import { dentroDoHorario, proximoIntervalo } from "./agenda";
import { lerCanal, postar, postarFoto } from "./telegram";
import { fotoComMarca, infoDoTexto } from "./imagem";
import { ehGrupoWhats, postarWhats, whatsLigado } from "./whatsapp";
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
        await inserirOferta({
            origem: g.chat,
            origem_post: p.chave,
            texto_original: p.texto,
            texto_final: r.ok ? r.texto : "",
            link_original: r.linkOriginal ?? null,
            link_afiliado: r.ok ? r.linkAfiliado : null,
            // sempre espera aprovação manual
            // link automático ligado = já aprova pra enviar (automação total quando ele sai)
            status: r.ok ? (cfg.link_automatico ? "aprovada" : "pendente") : "erro",
            motivo: r.ok ? null : r.motivo,
            imagem: r.ok ? r.imagem : null,
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

/** Posta a próxima oferta aprovada; com `id`, posta essa oferta (botão "Disparar agora"). */
export async function disparar(cfg: Config, forcar = false, id?: string) {
  if (!forcar) {
    if (!cfg.ativo) return "disparo desligado";
    if (!dentroDoHorario(cfg)) return "fora do horário";
    if (cfg.proximo_envio && new Date(cfg.proximo_envio) > new Date()) return "aguardando intervalo";
  }
  const busca = db().from("auto_ofertas").select("*");
  const { data: oferta } = await (id
    ? busca.eq("id", id).in("status", ["pendente", "aprovada", "erro"])
    : busca.eq("status", "aprovada").order("criado_em").limit(1)
  ).maybeSingle();
  if (!oferta) return id ? "oferta não encontrada (já foi enviada?)" : "fila vazia";
  if (!oferta.texto_final) return "oferta sem texto";
  const { data: destinos } = await db().from("auto_grupos").select("chat").eq("tipo", "destino").eq("ativo", true);
  if (!destinos?.length) return "nenhum canal de destino";
  // token do bot só é obrigatório se houver canal de Telegram entre os destinos
  if (!cfg.bot_token && destinos.some((d) => !ehGrupoWhats(d.chat))) return "falta o token do bot";

  const erros: string[] = [];
  let enviou = false;
  // foto do produto (a vitrine do link original tem a imagem); sem foto, vai só o texto
  const foto = oferta.imagem ?? (oferta.link_original ? await lerProduto(oferta.link_original).then((p) => p?.imagem ?? null).catch(() => null) : null);
  const info = infoDoTexto(oferta.texto_final);
  // a arte leva o @ do canal de Telegram (ou achou_ofertas); a mesma arte vai pros dois
  const marca = destinos.map((d) => d.chat).find((c) => c.startsWith("@")) ?? "@achou_ofertas";
  const png = foto ? await fotoComMarca(foto, marca, info).catch(() => null) : null;
  for (const d of destinos) {
    try {
      if (ehGrupoWhats(d.chat)) {
        if (!whatsLigado()) throw new Error("WhatsApp não configurado (falta a Evolution na Vercel)");
        await postarWhats(d.chat, oferta.texto_final, png);
      } else if (png) {
        await postarFoto(cfg.bot_token, d.chat, png, oferta.texto_final);
      } else {
        await postar(cfg.bot_token, d.chat, oferta.texto_final);
      }
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

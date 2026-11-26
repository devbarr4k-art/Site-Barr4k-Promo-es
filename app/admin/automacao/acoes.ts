"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isLoggedIn } from "@/lib/auth";
import { db, lerConfig } from "@/lib/automacao/db";
import { capturar, disparar } from "@/lib/automacao/ciclo";
import { lerParamsAfiliado } from "@/lib/automacao/ml";
import { nomeCanal } from "@/lib/automacao/telegram";
import { processar, TEMPLATE_PADRAO } from "@/lib/automacao/oferta";

const AQUI = "/admin/automacao";
const txt = (f: FormData, k: string) => String(f.get(k) ?? "").trim();

async function guarda() {
  if (!(await isLoggedIn())) redirect("/admin");
}

function voltar(msg: string, aba = "", erro = false, extra = ""): never {
  revalidatePath(AQUI);
  const q = new URLSearchParams(extra);
  q.set(erro ? "erro" : "ok", msg);
  if (aba) q.set("aba", aba);
  redirect(`${AQUI}?${q}`);
}

export async function salvarConfig(f: FormData) {
  await guarda();
  const atual = await lerConfig();
  const n = (k: string, min: number, max: number, padrao: number) => {
    const v = Number(txt(f, k));
    return Number.isFinite(v) && txt(f, k) !== "" ? Math.min(max, Math.max(min, Math.round(v))) : padrao;
  };
  const novo: Record<string, unknown> = {
    aprovacao_manual: f.get("aprovacao_manual") === "on",
    hora_inicio: n("hora_inicio", 0, 23, atual.hora_inicio),
    hora_fim: n("hora_fim", 1, 24, atual.hora_fim),
    intervalo_min: n("intervalo_min", 1, 600, atual.intervalo_min),
    palavras_bloqueadas: txt(f, "palavras_bloqueadas").split(/\n|,/).map((s) => s.trim()).filter(Boolean),
    // igual ao modelo padrão = guarda vazio, assim melhorias futuras no padrão chegam sozinhas
    template: txt(f, "template").replace(/\r\n/g, "\n") === TEMPLATE_PADRAO ? "" : txt(f, "template"),
  };
  novo.intervalo_max = Math.max(novo.intervalo_min as number, n("intervalo_max", 1, 600, atual.intervalo_max));

  // token: só troca se digitou um novo (o campo vem vazio pra não expor o salvo)
  const token = txt(f, "bot_token");
  if (token) novo.bot_token = token;

  // link de afiliado do Mercado Livre: abre o link e copia matt_tool / matt_word
  const linkML = txt(f, "link_ml");
  if (linkML) {
    const p = await lerParamsAfiliado(linkML).catch(() => null);
    if (!p) voltar("Não deu pra abrir esse link do Mercado Livre. Confira e tente de novo.", "config", true);
    if (!p.matt_tool) voltar("Esse link não tem o código de afiliado (matt_tool). Gere um link no painel de afiliados do Mercado Livre e cole aqui.", "config", true);
    novo.ml_matt_tool = p.matt_tool;
    novo.ml_matt_word = p.matt_word;
  }

  const { error } = await db().from("auto_config").update(novo).eq("id", 1);
  if (error) voltar(`Não salvou: ${error.message}`, "config", true);
  if (novo.ml_matt_tool) {
    // os posts que ficaram parados por falta do link entram de novo no próximo minuto
    await db().from("auto_ofertas").delete().eq("status", "erro").ilike("motivo", "%link de afiliado%");
    await db().from("auto_grupos").update({ ultimo_post: 0 }).eq("tipo", "origem");
  }
  voltar("Configurações salvas.", "config");
}

export async function alternarAtivo(f: FormData) {
  await guarda();
  const ativo = f.get("ativo") === "1";
  await db().from("auto_config").update({ ativo, proximo_envio: null }).eq("id", 1);
  voltar(ativo ? "Disparo ligado." : "Disparo desligado.");
}

export async function addCanal(f: FormData) {
  await guarda();
  const chat = nomeCanal(txt(f, "chat"));
  const tipo = txt(f, "tipo") === "origem" ? "origem" : "destino";
  if (!chat) voltar("Coloque o @ do canal.", "canais", true);
  const { error } = await db().from("auto_grupos").insert({ chat: `@${chat}`, tipo });
  if (error) voltar(`Não salvou: ${error.message}`, "canais", true);
  voltar(`@${chat} adicionado.`, "canais");
}

export async function removerCanal(f: FormData) {
  await guarda();
  await db().from("auto_grupos").delete().eq("id", txt(f, "id"));
  voltar("Canal removido.", "canais");
}

export async function mudarStatus(f: FormData) {
  await guarda();
  const status = txt(f, "status");
  if (!["aprovada", "descartada", "pendente"].includes(status)) return;
  const texto = txt(f, "texto");
  const dados: Record<string, unknown> = { status, motivo: null };
  if (texto) dados.texto_final = texto.slice(0, 4000);
  await db().from("auto_ofertas").update(dados).eq("id", txt(f, "id")).neq("status", "enviada");
  voltar(status === "aprovada" ? "Oferta aprovada: entra na fila de envio." : status === "descartada" ? "Oferta descartada." : "Voltou pra aprovação.", txt(f, "aba") || "fila", false, txt(f, "volta"));
}

export async function addOferta(f: FormData) {
  await guarda();
  const msg = txt(f, "mensagem");
  const cfg = await lerConfig();
  const r = await processar(msg, [], cfg);
  if (!r.ok) voltar(`Não entrou: ${r.motivo}.`, "fila", true);
  await db().from("auto_ofertas").insert({
    origem: "manual",
    texto_original: msg,
    texto_final: r.texto,
    link_original: r.linkOriginal,
    link_afiliado: r.linkAfiliado,
    status: cfg.aprovacao_manual ? "pendente" : "aprovada",
  });
  voltar("Oferta adicionada.", "fila");
}

export async function rodarAgora() {
  await guarda();
  const cfg = await lerConfig();
  const cap = await capturar(cfg);
  voltar(`Verifiquei os canais: ${cap.length ? cap.length + " post(s) novo(s) processado(s)" : "nada novo"}.`);
}

export async function enviarAgora() {
  await guarda();
  const r = await disparar(await lerConfig(), true);
  voltar(r === "enviada" ? "Oferta enviada agora." : `Não enviou: ${r}.`, "", r !== "enviada");
}

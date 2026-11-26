import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Só no servidor: service role (o navegador nunca vê essa chave).
let cliente: SupabaseClient | null = null;
export function db() {
  const url = process.env.SUPABASE_URL;
  const chave = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !chave) throw new Error("Faltam SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY nas variáveis da Vercel.");
  cliente ??= createClient(url, chave, { auth: { persistSession: false } });
  return cliente;
}

export const dbPronto = () => !!process.env.SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;

export type Config = {
  ativo: boolean;
  aprovacao_manual: boolean;
  bot_token: string;
  ml_matt_tool: string;
  ml_matt_word: string;
  hora_inicio: number;
  hora_fim: number;
  intervalo_min: number;
  intervalo_max: number;
  palavras_bloqueadas: string[];
  template: string;
  ultimo_ciclo: string | null;
  proximo_envio: string | null;
  ultimo_erro: string | null;
};

export async function lerConfig(): Promise<Config> {
  const { data, error } = await db().from("auto_config").select("*").eq("id", 1).single();
  if (error) throw new Error(`Banco: ${error.message}`);
  return data as Config;
}

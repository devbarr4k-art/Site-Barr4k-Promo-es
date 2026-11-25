import { list, put } from "@vercel/blob";
import { randomBytes } from "crypto";
import { promises as fs } from "fs";
import os from "os";
import path from "path";

// Leads ficam num Vercel Blob PRIVADO (só o servidor lê, com o BLOB_READ_WRITE_TOKEN).
// Cada lead é um arquivo; os dados também vão no nome do arquivo, então o painel
// lista tudo com uma chamada só, sem abrir arquivo por arquivo.
// O nome começa com (9999999999999 - agora): a listagem já sai do mais novo pro mais antigo.
// No PC, sem token, salva num arquivo temporário só pra testar.

export type Canal = "telegram" | "whatsapp";
export type Lead = { email: string; telefone: string; canal: Canal; em: string; origem: string };

const LOCAL = path.join(os.tmpdir(), "achou-site", "leads.jsonl");
export const blobPronto = () => !!process.env.BLOB_READ_WRITE_TOKEN;

const b64 = (s: string) => Buffer.from(s, "utf8").toString("base64url");
const unb64 = (s: string) => Buffer.from(s, "base64url").toString("utf8");

export function limparEmail(v: unknown) {
  const e = typeof v === "string" ? v.trim().toLowerCase().slice(0, 120) : "";
  return /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(e) ? e : null;
}

/** Aceita celular BR com ou sem +55/DDD formatado; devolve só dígitos com 55 na frente */
export function limparTelefone(v: unknown) {
  let d = typeof v === "string" ? v.replace(/\D/g, "") : "";
  if (d.startsWith("55") && d.length >= 12) d = d.slice(2);
  if (d.length !== 10 && d.length !== 11) return null;
  return "55" + d;
}

export async function salvarLead(lead: Lead) {
  const chave = String(9999999999999 - Date.now()).padStart(13, "0");
  const dados = b64(JSON.stringify(lead));
  const nome = `leads/${chave}_${randomBytes(4).toString("hex")}_${dados}.json`;
  if (blobPronto()) {
    await put(nome, JSON.stringify(lead), {
      access: "private",
      contentType: "application/json",
      addRandomSuffix: false,
    });
    return;
  }
  if (process.env.VERCEL) throw new Error("BLOB_READ_WRITE_TOKEN não configurado");
  await fs.mkdir(path.dirname(LOCAL), { recursive: true });
  await fs.appendFile(LOCAL, JSON.stringify(lead) + "\n");
}

function lerNome(pathname: string): Lead | null {
  const m = pathname.match(/^leads\/\d+_[0-9a-f]+_([A-Za-z0-9_-]+)\.json$/);
  if (!m) return null;
  try {
    const o = JSON.parse(unb64(m[1]));
    return { email: String(o.email), telefone: String(o.telefone), canal: o.canal === "whatsapp" ? "whatsapp" : "telegram", em: String(o.em), origem: String(o.origem ?? "") };
  } catch {
    return null;
  }
}

/** Todos os leads, do mais novo pro mais antigo */
export async function listarLeads(): Promise<Lead[]> {
  if (blobPronto()) {
    const out: Lead[] = [];
    let cursor: string | undefined;
    do {
      const r = await list({ prefix: "leads/", limit: 1000, cursor });
      for (const b of r.blobs) {
        const l = lerNome(b.pathname);
        if (l) out.push(l);
      }
      cursor = r.hasMore ? r.cursor : undefined;
    } while (cursor && out.length < 100000);
    return out;
  }
  const txt = await fs.readFile(LOCAL, "utf8").catch(() => "");
  return txt
    .split("\n")
    .filter(Boolean)
    .map((l) => JSON.parse(l) as Lead)
    .reverse();
}

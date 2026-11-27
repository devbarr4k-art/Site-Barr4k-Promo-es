import { del, list, put } from "@vercel/blob";
import { promises as fs } from "fs";
import os from "os";
import path from "path";

// Interesses que a pessoa escolhe (opcional) depois de liberar o grupo.
// Ficam no mesmo Blob privado dos leads: interesses/<email em base64>_<dados em base64>.json

import { CATEGORIAS, type Categoria } from "./categorias";
export { CATEGORIAS, nomeCategoria, type Categoria } from "./categorias";

const LOCAL = path.join(os.tmpdir(), "achou-site", "interesses.jsonl");
const b64 = (s: string) => Buffer.from(s, "utf8").toString("base64url");
const unb64 = (s: string) => Buffer.from(s, "base64url").toString("utf8");
const blob = () => !!process.env.BLOB_READ_WRITE_TOKEN;

export function limparInteresses(v: unknown): Categoria[] {
  const validos = new Set<string>(CATEGORIAS.map(([k]) => k));
  return Array.isArray(v) ? ([...new Set(v.filter((x) => typeof x === "string" && validos.has(x)))] as Categoria[]) : [];
}

export async function salvarInteresses(email: string, interesses: Categoria[]) {
  const dados = b64(JSON.stringify({ i: interesses, em: new Date().toISOString() }));
  if (blob()) {
    const prefixo = `interesses/${b64(email)}_`;
    const antigos = await list({ prefix: prefixo, limit: 100 });
    await put(`${prefixo}${dados}.json`, "{}", { access: "private", contentType: "application/json", addRandomSuffix: false });
    const velhos = antigos.blobs.map((b) => b.pathname).filter((p) => p !== `${prefixo}${dados}.json`);
    if (velhos.length) await del(velhos);
    return;
  }
  if (process.env.VERCEL) throw new Error("BLOB_READ_WRITE_TOKEN não configurado");
  await fs.mkdir(path.dirname(LOCAL), { recursive: true });
  await fs.appendFile(LOCAL, JSON.stringify({ email, i: interesses }) + "\n");
}

/** e-mail → interesses (o mais recente de cada pessoa) */
export async function lerInteresses(): Promise<Map<string, Categoria[]>> {
  const mapa = new Map<string, Categoria[]>();
  if (blob()) {
    let cursor: string | undefined;
    do {
      const r = await list({ prefix: "interesses/", limit: 1000, cursor });
      for (const b of r.blobs) {
        const m = b.pathname.match(/^interesses\/([A-Za-z0-9_-]+)_([A-Za-z0-9_-]+)\.json$/);
        if (!m) continue;
        try {
          mapa.set(unb64(m[1]), limparInteresses(JSON.parse(unb64(m[2])).i));
        } catch {}
      }
      cursor = r.hasMore ? r.cursor : undefined;
    } while (cursor);
    return mapa;
  }
  const txt = await fs.readFile(LOCAL, "utf8").catch(() => "");
  for (const l of txt.split("\n").filter(Boolean)) {
    try {
      const o = JSON.parse(l);
      mapa.set(o.email, limparInteresses(o.i));
    } catch {}
  }
  return mapa;
}

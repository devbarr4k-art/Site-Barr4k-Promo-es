// Arte do post no visual do achou.io: fundo preto, lima, logo ACHOU, foto em cartão branco e o @ do canal.
import { readFile } from "fs/promises";
import path from "path";
import { ImageResponse } from "next/og";

const W = 1000;
const H = 1100;
const LIME = "#c6ff00";
const PRETO = "#050505";
const TINTA = "#0b0b0b";
const OFF = "#ededE6";
const CINZA = "#a3a39d";
const LINHA = "rgba(237,237,230,0.14)";

type Fonte = { name: string; data: Buffer; weight: 600 | 800 | 900; style: "normal" | "italic" };
let fontes: Promise<Fonte[]> | null = null;
function carregarFontes() {
  const pasta = path.join(process.cwd(), "lib/automacao/fontes");
  const f = (arq: string, name: string, weight: Fonte["weight"], style: Fonte["style"] = "normal") =>
    readFile(path.join(pasta, arq)).then((data): Fonte => ({ name, data, weight, style }));
  fontes ??= Promise.all([
    f("InterTight-SemiBold.ttf", "Tight", 600),
    f("InterTight-ExtraBold.ttf", "Tight", 800),
    f("Poppins-ExtraBold.ttf", "Poppins", 800),
    f("Archivo-BlackItalic.ttf", "Archivo", 900, "italic"),
  ]);
  return fontes;
}

/** Símbolo da marca (check que vira seta, sobre lima), igual ao do site. */
function Simbolo({ lado }: { lado: number }) {
  return (
    <svg width={lado} height={lado} viewBox="0 0 64 64">
      <rect width="64" height="64" rx="18" fill={LIME} />
      <path d="M15 33.5 L26.5 45 L47.5 21.5" fill="none" stroke={TINTA} strokeWidth="6.5" strokeLinecap="square" strokeLinejoin="miter" />
      <path d="M35.5 20 H48.5 V33" fill="none" stroke={TINTA} strokeWidth="6.5" strokeLinecap="square" strokeLinejoin="miter" />
    </svg>
  );
}

export type InfoArte = { preco?: string | null; precoAntigo?: string | null; desconto?: string | null };

/** Tira preço, preço antigo e desconto do texto final do post (vale mesmo se ele foi editado). */
export function infoDoTexto(t: string): InfoArte {
  return {
    desconto: t.match(/\((\d{1,2}%) OFF\)/)?.[1] ?? null,
    preco: t.match(/Por:?\s*\*?(R\$\s?[\d.,]+\d)/i)?.[1] ?? null,
    precoAntigo: t.match(/De:?\s*~(R\$\s?[\d.,]+\d)~/i)?.[1] ?? null,
  };
}

export async function fotoComMarca(src: string, canal: string, info: InfoArte = {}): Promise<ArrayBuffer> {
  // baixa a foto antes: se o Mercado Livre falhar, o post sai sem imagem em vez de travar
  const r = await fetch(src, { signal: AbortSignal.timeout(8000) });
  if (!r.ok) throw new Error(`foto respondeu ${r.status}`);
  const tipo = r.headers.get("content-type") ?? "image/jpeg";
  const foto = `data:${tipo};base64,${Buffer.from(await r.arrayBuffer()).toString("base64")}`;
  const nome = canal.replace(/^@/, "");

  const img = new ImageResponse(
    (
      <div style={{ width: W, height: H, display: "flex", flexDirection: "column", background: PRETO, padding: "40px 44px 40px", fontFamily: "Tight", color: OFF }}>
        {/* topo: logo + selo de desconto */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 76 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Simbolo lado={62} />
            <div style={{ display: "flex", fontFamily: "Archivo", fontStyle: "italic", fontWeight: 900, fontSize: 60, letterSpacing: -2, color: OFF }}>ACHOU</div>
          </div>
          {info.desconto ? (
            <div
              style={{
                display: "flex",
                padding: "10px 24px",
                borderRadius: 999,
                background: LIME,
                color: TINTA,
                fontSize: 38,
                fontWeight: 800,
              }}
            >
              -{info.desconto} OFF
            </div>
          ) : (
            <div style={{ display: "flex", fontSize: 26, fontWeight: 600, color: CINZA }}>oferta no Mercado Livre</div>
          )}
        </div>

        {/* foto em cartão branco, grande */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginTop: 24,
            height: 700,
            borderRadius: 40,
            background: "#ffffff",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={foto} alt="" style={{ width: 860, height: 660, objectFit: "contain" }} />
        </div>

        {/* preço */}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end", marginTop: 18, height: 150 }}>
          {info.precoAntigo ? (
            <div style={{ display: "flex", fontSize: 34, fontWeight: 600, color: CINZA, textDecoration: "line-through" }}>{info.precoAntigo}</div>
          ) : null}
          <div style={{ display: "flex", fontFamily: "Poppins", fontSize: !info.preco ? 64 : info.preco.length > 12 ? 96 : 112, fontWeight: 800, color: LIME, letterSpacing: -3, lineHeight: 1.05 }}>
            {info.preco ?? "Confira o preço"}
          </div>
        </div>

        {/* rodapé curto */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: "auto",
            paddingTop: 18,
            borderTop: `2px solid ${LINHA}`,
            fontSize: 28,
            fontWeight: 600,
          }}
        >
          <div style={{ display: "flex", color: CINZA }}>Mais ofertas todo dia no Telegram</div>
          <div style={{ display: "flex", fontWeight: 800, color: LIME }}>@{nome}</div>
        </div>
      </div>
    ),
    { width: W, height: H, fonts: await carregarFontes() },
  );
  return img.arrayBuffer();
}

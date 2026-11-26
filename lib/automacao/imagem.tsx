// Arte do post: foto do produto, preço em destaque e faixa do canal com QR code.
import { readFile } from "fs/promises";
import path from "path";
import { ImageResponse } from "next/og";
import QRCode from "qrcode";

const W = 1000;
const H = 1080;
const LIME = "#c6ff00";
const PRETO = "#0a0a0a";
const LARANJA = "#ff6b00";

let fontes: Promise<{ name: string; data: Buffer; weight: 600 | 800; style: "normal" }[]> | null = null;
function carregarFontes() {
  const pasta = path.join(process.cwd(), "lib/automacao/fontes");
  fontes ??= Promise.all([
    readFile(path.join(pasta, "Poppins-SemiBold.ttf")).then((data) => ({ name: "Poppins", data, weight: 600 as const, style: "normal" as const })),
    readFile(path.join(pasta, "Poppins-ExtraBold.ttf")).then((data) => ({ name: "Poppins", data, weight: 800 as const, style: "normal" as const })),
  ]);
  return fontes;
}

/** QR code como SVG (um retângulo por quadradinho preto). */
function qr(texto: string, lado: number) {
  const m = QRCode.create(texto, { errorCorrectionLevel: "M" }).modules;
  const n = m.size;
  const rects = [];
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (m.get(x, y)) rects.push(<rect key={`${x}-${y}`} x={x} y={y} width={1.02} height={1.02} fill={PRETO} />);
  return (
    <svg width={lado} height={lado} viewBox={`0 0 ${n} ${n}`}>
      {rects}
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
  const arroba = `@${nome}`;

  const img = new ImageResponse(
    (
      <div style={{ width: W, height: H, display: "flex", flexDirection: "column", background: "#fff", fontFamily: "Poppins" }}>
        {/* foto */}
        <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", height: 600, paddingTop: 24 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={foto} alt="" style={{ width: 560, height: 560, objectFit: "contain" }} />
          {info.desconto ? (
            <div
              style={{
                position: "absolute",
                top: 34,
                right: 34,
                display: "flex",
                padding: "10px 26px",
                borderRadius: 999,
                background: "#e11d48",
                color: "#fff",
                fontSize: 40,
                fontWeight: 800,
              }}
            >
              -{info.desconto} OFF
            </div>
          ) : null}
        </div>

        {/* preço */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 230, paddingBottom: 14 }}>
          {info.precoAntigo ? (
            <div style={{ display: "flex", fontSize: 32, fontWeight: 600, color: "#8a8a8a", textDecoration: "line-through", marginBottom: 6 }}>
              {info.precoAntigo}
            </div>
          ) : null}
          {info.preco ? (
            <div
              style={{
                display: "flex",
                padding: "6px 54px",
                borderRadius: 18,
                background: LARANJA,
                color: "#fff",
                fontSize: 88,
                fontWeight: 800,
                letterSpacing: -2,
                boxShadow: `0 10px 0 ${PRETO}`,
                border: `5px solid ${PRETO}`,
              }}
            >
              {info.preco}
            </div>
          ) : (
            <div style={{ display: "flex", fontSize: 60, fontWeight: 800, color: PRETO }}>Oferta no Mercado Livre</div>
          )}
        </div>

        {/* faixa do canal */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: 250,
            padding: "0 44px 0 54px",
            background: LIME,
            borderTop: `6px solid ${PRETO}`,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", color: PRETO }}>
            <div style={{ display: "flex", fontSize: 44, fontWeight: 800, lineHeight: 1.1, fontStyle: "italic" }}>Entre no canal do Telegram</div>
            <div style={{ display: "flex", fontSize: 34, fontWeight: 600, marginTop: 8 }}>Promoções e cupons todos os dias!</div>
            <div
              style={{
                display: "flex",
                alignSelf: "flex-start",
                marginTop: 16,
                padding: "6px 22px",
                borderRadius: 999,
                background: PRETO,
                color: LIME,
                fontSize: 32,
                fontWeight: 800,
              }}
            >
              {arroba}
            </div>
          </div>
          <div style={{ display: "flex", padding: 12, background: "#fff", borderRadius: 16, border: `4px solid ${PRETO}` }}>
            {qr(`https://t.me/${nome}`, 170)}
          </div>
        </div>
      </div>
    ),
    { width: W, height: H, fonts: await carregarFontes() },
  );
  return img.arrayBuffer();
}

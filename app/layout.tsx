import type { Metadata, Viewport } from "next";
import { Archivo, Inter, Inter_Tight, Poppins } from "next/font/google";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const interTight = Inter_Tight({ variable: "--font-tight", subsets: ["latin"] });
const poppins = Poppins({ variable: "--font-poppins", subsets: ["latin"], weight: ["500", "600", "700", "800"] });
const archivo = Archivo({ variable: "--font-archivo", subsets: ["latin"], style: ["italic"], axes: ["wdth"] });

export const metadata: Metadata = {
  title: "ACHOU · A gente acha. Você economiza.",
  description:
    "Promoções conferidas uma por uma antes de chegar no seu celular. Entre no grupo do Telegram ou na comunidade do WhatsApp da ACHOU. É de graça.",
  metadataBase: new URL("https://achou.io"),
  openGraph: {
    title: "ACHOU · A gente acha. Você economiza.",
    description: "Promoções de verdade, sem spam. No Telegram e no WhatsApp.",
    locale: "pt_BR",
    type: "website",
  },
};

export const viewport: Viewport = { themeColor: "#050505" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" translate="no" className={`${inter.variable} ${interTight.variable} ${poppins.variable} ${archivo.variable}`}>
      <body>{children}</body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ACHOU · A gente encontra. Você economiza.",
  description:
    "Promoções conferidas uma por uma antes de chegar no seu celular. Entre no grupo do Telegram ou na comunidade do WhatsApp da ACHOU. É de graça.",
  metadataBase: new URL("https://achou.io"),
  openGraph: {
    title: "ACHOU · A gente encontra. Você economiza.",
    description: "Promoções de verdade, sem spam. No Telegram e no WhatsApp.",
    locale: "pt_BR",
    type: "website",
  },
};

export const viewport: Viewport = { themeColor: "#050505" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" translate="no" className={inter.variable}>
      <head>
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link
          rel="stylesheet"
          href="https://api.fontshare.com/v2/css?f[]=general-sans@500,600,700,500i,600i,700i&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}

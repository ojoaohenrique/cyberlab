import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });
const jetbrains = JetBrains_Mono({ variable: "--font-jetbrains", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: {
    default: "Cyber Lab — OSINT e cibersegurança",
    template: "%s | Cyber Lab",
  },
  description:
    "Diretório de ferramentas OSINT, investigação de alvos com links prontos e utilitários de cibersegurança que rodam no navegador.",
};

export const viewport: Viewport = {
  themeColor: "#07090b",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${jetbrains.variable}`}>
      <body className="min-h-dvh">
        <SiteHeader />
        <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-6 sm:px-6">{children}</main>
        <footer className="border-t border-line">
          <div className="mx-auto max-w-6xl px-4 py-6 text-xs leading-relaxed text-dim sm:px-6">
            Use estas ferramentas apenas de forma ética e legal: em alvos que você tem autorização para
            investigar e respeitando a LGPD e os termos de uso de cada serviço. Os links levam a sites de
            terceiros. Só o Scanner passa pelo servidor do Cyber Lab; o resto roda no seu navegador.
          </div>
        </footer>
      </body>
    </html>
  );
}

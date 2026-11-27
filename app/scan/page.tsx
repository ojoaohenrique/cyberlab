import type { Metadata } from "next";
import { Suspense } from "react";
import { Scanner } from "@/components/Scanner";

export const metadata: Metadata = {
  title: "Scanner",
  description: "Coleta passiva de informações de um site: título, IP, servidor, CMS, cabeçalhos, DNS e geolocalização.",
};

export default function ScanPage() {
  return (
    <>
      <div className="mb-6">
        <p className="font-mono text-xs text-accent">$ scan --passivo</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">Scanner</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          Reconhecimento rápido de um site. Diferente das outras páginas, esta usa o servidor do Cyber Lab para fazer a
          requisição, então o site alvo vê o IP do servidor, não o seu. Endereços de rede interna são bloqueados.
        </p>
      </div>
      <Suspense fallback={<div className="card h-64 animate-pulse" />}>
        <Scanner />
      </Suspense>
    </>
  );
}

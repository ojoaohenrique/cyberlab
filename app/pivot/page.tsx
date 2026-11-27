import type { Metadata } from "next";
import { Suspense } from "react";
import { Pivot } from "@/components/Pivot";

export const metadata: Metadata = {
  title: "Investigar alvo",
  description: "Cole um indicador e receba links de investigação prontos para o tipo detectado.",
};

export default function PivotPage() {
  return (
    <>
      <div className="mb-6">
        <p className="font-mono text-xs text-accent">$ pivot --auto</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">Investigar alvo</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          Cole um alvo e o tipo é detectado sozinho. Indicadores desarmados (como <code className="font-mono">hxxp</code>{" "}
          e <code className="font-mono">[.]</code>) são reativados. Nada é enviado a servidores: os links só abrem
          quando você clica.
        </p>
      </div>
      <Suspense fallback={<div className="card h-32 animate-pulse" />}>
        <Pivot />
      </Suspense>
    </>
  );
}

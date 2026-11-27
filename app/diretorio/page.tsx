import Link from "next/link";
import { Crosshair, FlaskConical } from "lucide-react";
import { Directory } from "@/components/Directory";
import { TOOL_COUNT } from "@/lib/catalog";

export const metadata = { title: "Diretório OSINT" };

export default function DirectoryPage() {
  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-xs text-accent">$ ls ./ferramentas --tree</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">Diretório OSINT</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted">
            {TOOL_COUNT} ferramentas reais de inteligência em fontes abertas, organizadas por tipo de dado. Marque as
            que você mais usa com a estrela: os favoritos ficam salvos neste navegador.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/pivot" className="btn-primary">
            <Crosshair className="size-4" />
            Investigar alvo
          </Link>
          <Link href="/lab" className="btn">
            <FlaskConical className="size-4" />
            Laboratório
          </Link>
        </div>
      </div>
      <Directory />
    </>
  );
}

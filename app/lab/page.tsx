import type { Metadata } from "next";
import { Lab } from "@/components/Lab";

export const metadata: Metadata = {
  title: "Laboratório",
  description: "Construtor de Google dorks, encode/decode, hashes SHA, decodificador de JWT e defang de IOCs.",
};

export default function LabPage() {
  return (
    <>
      <div className="mb-6">
        <p className="font-mono text-xs text-accent">$ ./lab --offline</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">Laboratório</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          Utilitários que rodam inteiramente no seu navegador. Nada do que você cola aqui sai do seu computador.
        </p>
      </div>
      <Lab />
    </>
  );
}

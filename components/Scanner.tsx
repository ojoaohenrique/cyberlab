"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CopyButton } from "./CopyButton";

interface ScanResult {
  target: string;
  finalUrl: string;
  redirects: { url: string; status: number }[];
  status: number;
  statusText: string;
  elapsedMs: number;
  basic: {
    title: string | null;
    description: string | null;
    ips: string[];
    server: string | null;
    poweredBy: string | null;
    cms: string[];
    cloudflare: boolean;
    robots: string | null;
  };
  headers: Record<string, string>;
  security: { name: string; desc: string; value: string | null }[];
  geo: {
    ip: string;
    hostname?: string | null;
    city?: string | null;
    region?: string | null;
    country?: string | null;
    loc?: string | null;
    org?: string | null;
    timezone?: string | null;
  };
  dns: { a: string[]; aaaa: string[]; mx: string[]; ns: string[]; txt: string[] };
}

const BANNER = String.raw`
        .-"""""-.
      .'  _   _  '.        ____   ____    _    _   _
     /   (o) (o)   \      / ___| / ___|  / \  | \ | |
    |   .-.___.-.   |     \___ \| |     / _ \ |  \| |
    |  /  |||||  \  |      ___) | |___ / ___ \| |\  |
     \ \  '---'  / /      |____/ \____/_/   \_\_| \_|
      '.'-.___.-'.'
        '-.___.-'          cyber_lab :: recon passivo
`;

type Tone = "ok" | "bad" | "warn" | "info" | "dim";
const TONE: Record<Tone, string> = {
  ok: "text-accent",
  bad: "text-danger",
  warn: "text-warn",
  info: "text-info",
  dim: "text-dim",
};

function Line({ mark = "+", label, value, tone = "ok" }: { mark?: string; label: string; value: React.ReactNode; tone?: Tone }) {
  return (
    <div className="flex gap-2 py-0.5">
      <span className="shrink-0 text-accent">[{mark}]</span>
      <span className="min-w-0 break-words">
        <span className="text-warn">{label}:</span> <span className={TONE[tone]}>{value}</span>
      </span>
    </div>
  );
}

function Panel({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`min-w-0 ${className}`}>
      <h2 className="font-bold tracking-[0.35em] text-info">{title}</h2>
      <p className="mb-2 text-info" aria-hidden>
        ---------------&gt;
      </p>
      {children}
    </section>
  );
}

export function Scanner() {
  const params = useSearchParams();
  const router = useRouter();
  const initial = params.get("url") ?? "";
  const [input, setInput] = useState(initial);
  const [state, setState] = useState<{ status: "idle" | "loading" | "done" | "error"; target?: string; data?: ScanResult; error?: string }>({
    status: "idle",
  });

  const scan = async (value: string) => {
    const v = value.trim();
    if (!v) return;
    setState({ status: "loading", target: v });
    router.replace(`/scan?url=${encodeURIComponent(v)}`, { scroll: false });
    try {
      const res = await fetch(`/api/scan?url=${encodeURIComponent(v)}`);
      const json = await res.json();
      if (!res.ok) setState({ status: "error", target: v, error: json.error ?? "Falha na varredura." });
      else setState({ status: "done", target: v, data: json });
    } catch {
      setState({ status: "error", target: v, error: "Falha de rede ao chamar o scanner." });
    }
  };

  // Se a página abriu com ?url=, roda a varredura uma vez.
  useEffect(() => {
    if (!initial) return;
    const t = setTimeout(() => scan(initial), 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const d = state.data;

  return (
    <div className="overflow-hidden rounded-lg border border-line bg-[#030405] shadow-2xl shadow-black/50">
      <div className="flex items-center gap-1.5 border-b border-line bg-panel px-3 py-2">
        <span className="size-3 rounded-full bg-danger/80" />
        <span className="size-3 rounded-full bg-warn/80" />
        <span className="size-3 rounded-full bg-accent/80" />
        <span className="ml-2 truncate font-mono text-xs text-dim">cyber_lab@scanner: ~</span>
      </div>

      <div className="p-4 font-mono text-[13px] leading-relaxed sm:p-6">
        <pre className="overflow-x-auto text-[8px] leading-tight text-warn sm:text-xs" aria-hidden>
          {BANNER}
        </pre>
        <p className="mt-2 text-xs text-dim">
          Coleta de informações em fontes abertas: título, IP, servidor, CMS, Cloudflare, robots.txt, cabeçalhos HTTP,
          DNS e geolocalização. Faz só uma visita comum à página, como um navegador.
        </p>

        <form
          className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center"
          onSubmit={(e) => {
            e.preventDefault();
            scan(input);
          }}
        >
          <label htmlFor="scan-url" className="shrink-0 text-accent">
            [#] Site alvo:
          </label>
          <input
            id="scan-url"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="https://example.com"
            autoComplete="off"
            spellCheck={false}
            className="min-w-0 flex-1 border-b border-line-strong bg-transparent py-1 text-fg caret-accent outline-none placeholder:text-dim focus:border-accent"
          />
          <button type="submit" className="btn-primary" disabled={state.status === "loading"}>
            {state.status === "loading" ? "Varrendo…" : "[A] Iniciar varredura"}
          </button>
        </form>

        {state.status !== "idle" && (
          <div className="mt-5">
            <p className="text-fg">[+] Iniciando varredura …</p>
            <p className="text-info">
              [i] Alvo: <span className="text-accent">{state.target}</span>
            </p>
            {state.status === "loading" && <p className="animate-pulse text-dim">[~] Aguardando resposta…</p>}
            {state.status === "error" && <p className="text-danger">[!] {state.error}</p>}
            {d && (
              <p className="text-dim">
                [✓] Concluído em {(d.elapsedMs / 1000).toFixed(1)}s · HTTP {d.status}
                {d.redirects.length > 0 && ` · ${d.redirects.length} redirecionamento(s)`}
              </p>
            )}
          </div>
        )}

        {d && (
          <div className="mt-8 grid gap-x-10 gap-y-8 lg:grid-cols-2">
            <Panel title="INFORMAÇÕES BÁSICAS">
              <Line label="Título" value={d.basic.title ?? "Não encontrado"} tone={d.basic.title ? "ok" : "bad"} />
              <Line label="URL final" value={d.finalUrl} />
              <Line label="Endereço IP" value={d.basic.ips.join(", ")} />
              <Line label="Servidor web" value={d.basic.server ?? "Não informado"} tone={d.basic.server ? "ok" : "bad"} />
              {d.basic.poweredBy && <Line label="X-Powered-By" value={d.basic.poweredBy} tone="warn" />}
              <Line
                label="CMS / framework"
                value={d.basic.cms.length ? d.basic.cms.join(", ") : "Não detectado"}
                tone={d.basic.cms.length ? "ok" : "bad"}
              />
              <Line label="Cloudflare" value={d.basic.cloudflare ? "Detectado" : "Não detectado"} tone={d.basic.cloudflare ? "warn" : "dim"} />
              <Line label="robots.txt" value={d.basic.robots ? "Encontrado" : "Não encontrado"} tone={d.basic.robots ? "ok" : "bad"} />
              {d.basic.description && <Line label="Descrição" value={d.basic.description} tone="dim" />}
              {d.redirects.map((r) => (
                <Line key={r.url} mark="→" label={`Redireciona (${r.status})`} value={r.url} tone="dim" />
              ))}
            </Panel>

            <Panel title="CABEÇALHOS HTTP">
              <Line mark="i" label="Status" value={`HTTP ${d.status} ${d.statusText}`} tone={d.status < 400 ? "ok" : "bad"} />
              {Object.entries(d.headers).map(([k, v]) => (
                <Line key={k} mark="i" label={k} value={v.length > 160 ? `${v.slice(0, 160)}…` : v} />
              ))}
            </Panel>

            <Panel title="GEOLOCALIZAÇÃO DO IP">
              <Line mark="i" label="IP" value={d.geo.ip} />
              <Line mark="i" label="País" value={d.geo.country ?? "N/D"} tone={d.geo.country ? "ok" : "bad"} />
              <Line mark="i" label="Estado" value={d.geo.region ?? "N/D"} tone={d.geo.region ? "ok" : "bad"} />
              <Line mark="i" label="Cidade" value={d.geo.city ?? "N/D"} tone={d.geo.city ? "ok" : "bad"} />
              <Line mark="i" label="Coordenadas" value={d.geo.loc ?? "N/D"} tone={d.geo.loc ? "ok" : "bad"} />
              <Line mark="i" label="Organização / ASN" value={d.geo.org ?? "N/D"} tone={d.geo.org ? "ok" : "bad"} />
              {d.geo.hostname && <Line mark="i" label="DNS reverso" value={d.geo.hostname} />}
              <p className="mt-2 text-xs text-dim">
                Fonte: ipinfo.io. Em sites atrás de CDN, a localização é a do servidor da CDN, não a da origem.
              </p>
            </Panel>

            <Panel title="CABEÇALHOS DE SEGURANÇA">
              {d.security.map((h) => (
                <Line
                  key={h.name}
                  mark={h.value ? "+" : "-"}
                  label={h.name}
                  value={h.value ? "Presente" : `Ausente — ${h.desc}`}
                  tone={h.value ? "ok" : "bad"}
                />
              ))}
              <p className="mt-2 text-xs text-dim">
                {d.security.filter((h) => h.value).length}/{d.security.length} cabeçalhos recomendados presentes.
              </p>
            </Panel>

            <Panel title="REGISTROS DNS">
              <Line mark="i" label="A" value={d.dns.a.join(", ") || "Nenhum"} tone={d.dns.a.length ? "ok" : "dim"} />
              <Line mark="i" label="AAAA" value={d.dns.aaaa.join(", ") || "Nenhum"} tone={d.dns.aaaa.length ? "ok" : "dim"} />
              <Line mark="i" label="NS" value={d.dns.ns.join(", ") || "Nenhum"} tone={d.dns.ns.length ? "ok" : "dim"} />
              <Line mark="i" label="MX" value={d.dns.mx.join(", ") || "Nenhum"} tone={d.dns.mx.length ? "ok" : "dim"} />
              {d.dns.txt.map((t, i) => (
                <Line key={i} mark="i" label="TXT" value={t} />
              ))}
            </Panel>

            <Panel title="ROBOTS.TXT">
              {d.basic.robots ? (
                <>
                  <pre className="max-h-64 overflow-auto whitespace-pre-wrap break-all rounded border border-line p-2 text-xs text-muted">
                    {d.basic.robots}
                  </pre>
                  <div className="mt-2">
                    <CopyButton value={d.basic.robots} className="px-2 py-0.5 text-xs" />
                  </div>
                </>
              ) : (
                <p className="text-danger">[-] O site não tem robots.txt.</p>
              )}
            </Panel>

            <div className="text-xs lg:col-span-2">
              <span className="text-accent">[»]</span> Próximo passo:{" "}
              <Link href={`/pivot?q=${encodeURIComponent(new URL(d.finalUrl).hostname)}`} className="text-info underline">
                investigar o domínio
              </Link>{" "}
              ou{" "}
              <Link href={`/pivot?q=${encodeURIComponent(d.basic.ips[0])}`} className="text-info underline">
                investigar o IP
              </Link>{" "}
              com links prontos para crt.sh, Shodan, VirusTotal e outros.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

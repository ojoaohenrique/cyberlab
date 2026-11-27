"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Building2, ExternalLink, Loader2, TerminalSquare } from "lucide-react";
import { buildPivots, detectType, refang, TARGET_LABELS, type PivotLink, type TargetType } from "@/lib/pivot";
import { CopyButton } from "./CopyButton";

const EXAMPLES: { label: string; value: string }[] = [
  { label: "domínio", value: "example.com" },
  { label: "IP", value: "8.8.8.8" },
  { label: "e-mail", value: "contato@example.com" },
  { label: "URL desarmada", value: "hxxps://example[.]com/login" },
  { label: "hash", value: "44d88612fea8a8f36de82e1278abb02f" },
  { label: "CNPJ", value: "00.000.000/0001-91" },
  { label: "username", value: "@torvalds" },
  { label: "carteira BTC", value: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa" },
];

export function Pivot() {
  const params = useSearchParams();
  const router = useRouter();
  const initial = params.get("q") ?? "";
  const [input, setInput] = useState(initial);
  const [target, setTarget] = useState(initial);
  const [override, setOverride] = useState<TargetType | null>(null);
  const [prevInitial, setPrevInitial] = useState(initial);

  // Quando a URL muda (ex.: link "domínio do e-mail"), sincroniza o campo.
  if (initial !== prevInitial) {
    setPrevInitial(initial);
    setInput(initial);
    setTarget(initial);
    setOverride(null);
  }

  const detected = useMemo(() => detectType(target), [target]);
  const type = override ?? detected;
  const sections = useMemo(() => (type && target ? buildPivots(type, target) : []), [type, target]);
  const clean = refang(target);

  const submit = (value: string) => {
    setInput(value);
    setTarget(value);
    setOverride(null);
    const url = value.trim() ? `/pivot?q=${encodeURIComponent(value.trim())}` : "/pivot";
    router.replace(url, { scroll: false });
  };

  return (
    <div className="space-y-6">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(input);
        }}
        className="card p-4"
      >
        <label htmlFor="alvo" className="label">
          Alvo
        </label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            id="alvo"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e-mail, domínio, IP, URL, hash, telefone, CNPJ, carteira ou username"
            autoComplete="off"
            spellCheck={false}
            className="field flex-1 py-2.5 text-base sm:text-sm"
          />
          <button type="submit" className="btn-primary py-2.5">
            Investigar
            <ArrowRight className="size-4" />
          </button>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-dim">Exemplos:</span>
          {EXAMPLES.map((ex) => (
            <button
              key={ex.value}
              type="button"
              onClick={() => submit(ex.value)}
              className="rounded-full border border-line px-2 py-0.5 font-mono text-muted transition hover:border-accent hover:text-accent"
            >
              {ex.label}
            </button>
          ))}
        </div>
      </form>

      {target.trim() && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="text-muted">Tipo:</span>
            {(Object.keys(TARGET_LABELS) as TargetType[]).map((t) => {
              const active = t === type;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setOverride(t === detected ? null : t)}
                  className={`rounded-md border px-2 py-0.5 font-mono text-xs transition ${
                    active
                      ? "border-accent bg-accent-dim text-accent"
                      : "border-line text-dim hover:border-line-strong hover:text-muted"
                  }`}
                >
                  {TARGET_LABELS[t]}
                  {t === detected && !override && " ✓"}
                </button>
              );
            })}
          </div>

          {clean !== target.trim() && (
            <p className="font-mono text-xs text-muted">
              Indicador reativado (refang): <span className="text-fg">{clean}</span>
            </p>
          )}

          {!type ? (
            <div className="card p-6 text-sm text-muted">
              Não consegui identificar o tipo desse alvo. Escolha um tipo acima para ver as ferramentas.
            </div>
          ) : (
            <>
              {type === "cnpj" && <CnpjLookup cnpj={clean} />}
              <div className="grid gap-4 md:grid-cols-2">
                {sections.map((s) => (
                  <section key={s.title} className="card p-4">
                    <h2 className="mb-3 font-mono text-xs uppercase tracking-wider text-accent">{s.title}</h2>
                    <ul className="space-y-1.5">
                      {s.links.map((l) => (
                        <PivotItem key={l.name + (l.href ?? l.command)} link={l} />
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function PivotItem({ link }: { link: PivotLink }) {
  if (link.command) {
    return (
      <li className="rounded-md border border-line bg-bg/60 p-2">
        <div className="mb-1 flex items-center justify-between gap-2">
          <span className="flex items-center gap-1.5 text-sm font-medium">
            <TerminalSquare className="size-4 text-fuchsia-300" />
            {link.name}
            <span className="rounded border border-fuchsia-400/40 px-1 font-mono text-[10px] text-fuchsia-300">local</span>
          </span>
          <CopyButton value={link.command} className="px-2 py-0.5 text-xs" />
        </div>
        <code className="block overflow-x-auto whitespace-pre font-mono text-xs text-accent">$ {link.command}</code>
        {link.note && <p className="mt-1 text-xs text-warn">{link.note}</p>}
      </li>
    );
  }
  const internal = link.href?.startsWith("/");
  const content = (
    <>
      <span className="flex-1">
        <span className="block text-sm font-medium group-hover:text-accent">{link.name}</span>
        {link.note && <span className="block text-xs text-dim">{link.note}</span>}
      </span>
      {internal ? <ArrowRight className="size-4 text-dim" /> : <ExternalLink className="size-3.5 text-dim" />}
    </>
  );
  const cls = "group flex items-center gap-2 rounded-md px-2 py-1.5 transition hover:bg-panel-2";
  return (
    <li>
      {internal ? (
        <Link href={link.href!} className={cls}>
          {content}
        </Link>
      ) : (
        <a href={link.href} target="_blank" rel="noopener noreferrer" className={cls}>
          {content}
        </a>
      )}
    </li>
  );
}

interface CnpjData {
  razao_social?: string;
  nome_fantasia?: string;
  descricao_situacao_cadastral?: string;
  data_inicio_atividade?: string;
  cnae_fiscal_descricao?: string;
  municipio?: string;
  uf?: string;
  capital_social?: number;
  qsa?: { nome_socio?: string; qualificacao_socio?: string }[];
  message?: string;
}

function CnpjLookup({ cnpj }: { cnpj: string }) {
  const digits = cnpj.replace(/\D/g, "");
  const [state, setState] = useState<{ key: string; status: "idle" | "loading" | "ok" | "erro"; data?: CnpjData }>({
    key: digits,
    status: "idle",
  });
  const current = state.key === digits ? state : { key: digits, status: "idle" as const };

  const run = async () => {
    setState({ key: digits, status: "loading" });
    try {
      const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${digits}`);
      const data: CnpjData = await res.json();
      setState({ key: digits, status: res.ok ? "ok" : "erro", data });
    } catch {
      setState({ key: digits, status: "erro" });
    }
  };

  return (
    <section className="card p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-accent">
          <Building2 className="size-4" /> Consulta direta na BrasilAPI
        </h2>
        <button type="button" className="btn" onClick={run} disabled={current.status === "loading"}>
          {current.status === "loading" && <Loader2 className="size-4 animate-spin" />}
          Consultar CNPJ
        </button>
      </div>
      <p className="mt-1 text-xs text-dim">
        A consulta é feita do seu navegador direto para brasilapi.com.br (dados públicos da Receita Federal).
      </p>
      {current.status === "erro" && (
        <p className="mt-3 text-sm text-danger">
          {current.data?.message ?? "Não foi possível consultar agora. Tente o link da BrasilAPI abaixo."}
        </p>
      )}
      {current.status === "ok" && current.data && (
        <dl className="mt-3 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
          {(
            [
              ["Razão social", current.data.razao_social],
              ["Nome fantasia", current.data.nome_fantasia],
              ["Situação", current.data.descricao_situacao_cadastral],
              ["Início de atividade", current.data.data_inicio_atividade],
              ["Atividade principal", current.data.cnae_fiscal_descricao],
              ["Município", [current.data.municipio, current.data.uf].filter(Boolean).join(" / ")],
              [
                "Capital social",
                current.data.capital_social != null
                  ? current.data.capital_social.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
                  : undefined,
              ],
            ] as const
          )
            .filter(([, v]) => v)
            .map(([k, v]) => (
              <div key={k}>
                <dt className="label mb-0">{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          {current.data.qsa && current.data.qsa.length > 0 && (
            <div className="sm:col-span-2">
              <dt className="label mb-0">Quadro societário</dt>
              <dd>
                <ul className="mt-1 space-y-0.5">
                  {current.data.qsa.map((s, i) => (
                    <li key={i}>
                      {s.nome_socio} <span className="text-dim">— {s.qualificacao_socio}</span>
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
          )}
        </dl>
      )}
    </section>
  );
}

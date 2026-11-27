"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Binary, ExternalLink, Fingerprint, KeyRound, Search, ShieldCheck } from "lucide-react";
import { defang, refang } from "@/lib/pivot";
import { CopyButton } from "./CopyButton";

const TOOLS = [
  { id: "dorks", label: "Google dorks", icon: Search },
  { id: "encode", label: "Encode / decode", icon: Binary },
  { id: "hash", label: "Hashes SHA", icon: Fingerprint },
  { id: "jwt", label: "JWT", icon: KeyRound },
  { id: "ioc", label: "Defang / refang", icon: ShieldCheck },
] as const;

type ToolId = (typeof TOOLS)[number]["id"];

export function Lab() {
  const [tab, setTab] = useState<ToolId>("dorks");
  return (
    <div className="space-y-4">
      <div role="tablist" aria-label="Utilitários" className="-mx-4 flex gap-1 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
        {TOOLS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            role="tab"
            type="button"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={`flex shrink-0 items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm transition ${
              tab === id
                ? "border-accent bg-accent-dim text-accent"
                : "border-line text-muted hover:border-line-strong hover:text-fg"
            }`}
          >
            <Icon className="size-4" />
            {label}
          </button>
        ))}
      </div>
      <div role="tabpanel" className="card p-4 sm:p-5">
        {tab === "dorks" && <DorkBuilder />}
        {tab === "encode" && <Encoder />}
        {tab === "hash" && <Hasher />}
        {tab === "jwt" && <JwtDecoder />}
        {tab === "ioc" && <Defanger />}
      </div>
    </div>
  );
}

/* ───────────────────────── Google dorks ───────────────────────── */

const DORK_PRESETS: { label: string; build: (site: string) => string }[] = [
  { label: "Documentos expostos", build: (s) => `${s} (filetype:pdf OR filetype:docx OR filetype:xlsx OR filetype:pptx)` },
  { label: "Planilhas e CSV", build: (s) => `${s} (filetype:xls OR filetype:xlsx OR filetype:csv)` },
  { label: "Diretórios listados", build: (s) => `${s} intitle:"index of"` },
  { label: "Páginas de login", build: (s) => `${s} (inurl:login OR inurl:signin OR intitle:"login")` },
  { label: "Arquivos de configuração", build: (s) => `${s} (ext:env OR ext:ini OR ext:conf OR ext:yml OR ext:cfg)` },
  { label: "Backups e dumps SQL", build: (s) => `${s} (ext:sql OR ext:bak OR ext:old OR ext:backup)` },
  { label: "Logs", build: (s) => `${s} ext:log` },
  { label: "Subdomínios (exceto www)", build: (s) => `${s} -inurl:www` },
  { label: "Menções em pastes", build: (s) => `${s.replace("site:", "")} (site:pastebin.com OR site:ghostbin.site OR site:justpaste.it)` },
];

function DorkBuilder() {
  const [f, setF] = useState({ site: "", exact: "", words: "", filetype: "", intitle: "", inurl: "", intext: "", exclude: "" });
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });
  const [preset, setPreset] = useState<string | null>(null);

  const quote = (v: string) => (/\s/.test(v) ? `"${v}"` : v);
  const built = [
    f.site && `site:${f.site.trim()}`,
    f.exact && `"${f.exact.trim()}"`,
    f.words.trim(),
    f.filetype && `filetype:${f.filetype.trim().replace(/^\./, "")}`,
    f.intitle && `intitle:${quote(f.intitle.trim())}`,
    f.inurl && `inurl:${quote(f.inurl.trim())}`,
    f.intext && `intext:${quote(f.intext.trim())}`,
    ...f.exclude
      .split(/[\s,]+/)
      .filter(Boolean)
      .map((w) => `-${w}`),
  ]
    .filter(Boolean)
    .join(" ");
  const query = preset ?? built;
  const q = encodeURIComponent(query);

  const fields: [keyof typeof f, string, string][] = [
    ["site", "Site / domínio (site:)", "example.com"],
    ["exact", "Frase exata", "relatório confidencial"],
    ["words", "Palavras livres", "senha OR password"],
    ["filetype", "Tipo de arquivo (filetype:)", "pdf"],
    ["intitle", "No título (intitle:)", "index of"],
    ["inurl", "Na URL (inurl:)", "admin"],
    ["intext", "No texto (intext:)", "CPF"],
    ["exclude", "Excluir termos (-)", "www, blog"],
  ];

  return (
    <div className="space-y-5">
      <Intro title="Construtor de Google dorks">
        Monte buscas avançadas preenchendo os campos ou use um modelo pronto. Os mesmos operadores funcionam, em parte, no
        Bing e no DuckDuckGo.
      </Intro>
      <div className="grid gap-3 sm:grid-cols-2">
        {fields.map(([k, label, ph]) => (
          <div key={k}>
            <label className="label" htmlFor={`dork-${k}`}>
              {label}
            </label>
            <input
              id={`dork-${k}`}
              className="field"
              value={f[k]}
              placeholder={ph}
              onChange={(e) => {
                setPreset(null);
                set(k)(e);
              }}
            />
          </div>
        ))}
      </div>
      <div>
        <span className="label">Modelos (usam o site preenchido)</span>
        <div className="flex flex-wrap gap-1.5">
          {DORK_PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              className="rounded-full border border-line px-2.5 py-1 text-xs text-muted transition hover:border-accent hover:text-accent"
              onClick={() => setPreset(p.build(f.site.trim() ? `site:${f.site.trim()}` : "site:example.com").trim())}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
      <Output value={query} placeholder="Preencha algum campo para gerar a busca">
        <a className="btn" href={`https://www.google.com/search?q=${q}`} target="_blank" rel="noopener noreferrer" aria-disabled={!query}>
          Google <ExternalLink className="size-3.5" />
        </a>
        <a className="btn" href={`https://www.bing.com/search?q=${q}`} target="_blank" rel="noopener noreferrer">
          Bing <ExternalLink className="size-3.5" />
        </a>
        <a className="btn" href={`https://duckduckgo.com/?q=${q}`} target="_blank" rel="noopener noreferrer">
          DuckDuckGo <ExternalLink className="size-3.5" />
        </a>
      </Output>
      <p className="text-xs text-warn">
        Encontrar um arquivo exposto não dá permissão para baixá-lo ou usá-lo. Reporte o problema ao responsável.
      </p>
    </div>
  );
}

/* ───────────────────────── Encode / decode ───────────────────────── */

type Codec = "base64" | "url" | "hex";

function toBase64(s: string) {
  const bytes = new TextEncoder().encode(s);
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin);
}
function fromBase64(s: string) {
  const norm = s.trim().replace(/-/g, "+").replace(/_/g, "/").replace(/\s/g, "");
  const padded = norm + "=".repeat((4 - (norm.length % 4)) % 4);
  const bin = atob(padded);
  return new TextDecoder("utf-8", { fatal: true }).decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
}
function toHex(s: string) {
  return Array.from(new TextEncoder().encode(s), (b) => b.toString(16).padStart(2, "0")).join(" ");
}
function fromHex(s: string) {
  const clean = s.replace(/0x/gi, "").replace(/[^a-f0-9]/gi, "");
  if (clean.length % 2) throw new Error("Quantidade ímpar de dígitos hex");
  const bytes = new Uint8Array(clean.match(/../g)?.map((h) => parseInt(h, 16)) ?? []);
  return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
}

function Encoder() {
  const [codec, setCodec] = useState<Codec>("base64");
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [input, setInput] = useState("");

  const { out, err } = useMemo(() => {
    if (!input) return { out: "", err: "" };
    try {
      const fns: Record<Codec, [(s: string) => string, (s: string) => string]> = {
        base64: [toBase64, fromBase64],
        url: [encodeURIComponent, decodeURIComponent],
        hex: [toHex, fromHex],
      };
      return { out: fns[codec][mode === "encode" ? 0 : 1](input), err: "" };
    } catch (e) {
      return { out: "", err: e instanceof Error ? `Entrada inválida: ${e.message}` : "Entrada inválida" };
    }
  }, [codec, mode, input]);

  return (
    <div className="space-y-4">
      <Intro title="Encode / decode">
        Converta texto entre Base64 (inclusive a variante URL-safe), codificação de URL e hexadecimal. Tudo em UTF-8.
      </Intro>
      <div className="flex flex-wrap gap-2">
        <Segmented value={codec} onChange={setCodec} options={[["base64", "Base64"], ["url", "URL"], ["hex", "Hex"]]} />
        <Segmented value={mode} onChange={setMode} options={[["encode", "Codificar"], ["decode", "Decodificar"]]} />
        <button
          type="button"
          className="btn"
          disabled={!out}
          onClick={() => {
            setInput(out);
            setMode(mode === "encode" ? "decode" : "encode");
          }}
        >
          ⇅ Inverter
        </button>
      </div>
      <TextArea label="Entrada" value={input} onChange={setInput} placeholder="Cole o texto aqui" />
      {err ? <p className="text-sm text-danger">{err}</p> : <Output value={out} multiline />}
    </div>
  );
}

/* ───────────────────────── Hashes ───────────────────────── */

const ALGOS = ["SHA-1", "SHA-256", "SHA-384", "SHA-512"] as const;

async function digest(data: BufferSource) {
  const entries = await Promise.all(
    ALGOS.map(async (a) => {
      const buf = await crypto.subtle.digest(a, data);
      return [a, Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("")] as const;
    }),
  );
  return Object.fromEntries(entries) as Record<(typeof ALGOS)[number], string>;
}

function Hasher() {
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<{ source: string; hashes: Record<string, string> } | null>(null);

  useEffect(() => {
    let cancel = false;
    const run = async () => {
      if (file) {
        const hashes = await digest(await file.arrayBuffer());
        if (!cancel) setResult({ source: `${file.name} (${file.size.toLocaleString("pt-BR")} bytes)`, hashes });
      } else if (text) {
        const hashes = await digest(new TextEncoder().encode(text));
        if (!cancel) setResult({ source: "texto", hashes });
      }
    };
    run();
    return () => {
      cancel = true;
    };
  }, [text, file]);

  return (
    <div className="space-y-4">
      <Intro title="Hashes SHA">
        Calcula SHA-1, SHA-256, SHA-384 e SHA-512 com a Web Crypto API do navegador. Arquivos não saem do seu computador.
        (MD5 não está disponível na Web Crypto.)
      </Intro>
      <TextArea
        label="Texto"
        value={text}
        onChange={(v) => {
          setFile(null);
          setText(v);
        }}
        placeholder="Digite ou cole um texto"
      />
      <div>
        <label className="label" htmlFor="hash-file">
          Ou escolha um arquivo
        </label>
        <input
          id="hash-file"
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="block w-full text-sm text-muted file:mr-3 file:rounded-md file:border file:border-line-strong file:bg-panel-2 file:px-3 file:py-1.5 file:text-sm file:text-fg hover:file:border-accent"
        />
      </div>
      {result && (text || file) && (
        <div className="space-y-2">
          <p className="font-mono text-xs text-dim">Origem: {result.source}</p>
          {ALGOS.map((a) => (
            <div key={a} className="rounded-md border border-line bg-bg/60 p-2">
              <div className="mb-1 flex items-center justify-between gap-2">
                <span className="font-mono text-xs text-muted">{a}</span>
                <CopyButton value={result.hashes[a]} className="px-2 py-0.5 text-xs" />
              </div>
              <code className="block break-all font-mono text-xs text-accent">{result.hashes[a]}</code>
            </div>
          ))}
          <Link href={`/pivot?q=${result.hashes["SHA-256"]}`} className="btn">
            Investigar SHA-256 →
          </Link>
        </div>
      )}
    </div>
  );
}

/* ───────────────────────── JWT ───────────────────────── */

const TIME_CLAIMS: Record<string, string> = { exp: "Expira em", iat: "Emitido em", nbf: "Válido a partir de", auth_time: "Autenticado em" };

function JwtDecoder() {
  const [token, setToken] = useState("");

  const decoded = useMemo(() => {
    const t = token.trim().replace(/^Bearer\s+/i, "");
    if (!t) return null;
    const parts = t.split(".");
    if (parts.length < 2) return { error: "Um JWT tem três partes separadas por ponto (header.payload.assinatura)." };
    try {
      const header = JSON.parse(fromBase64(parts[0]));
      const payload = JSON.parse(fromBase64(parts[1]));
      return { header, payload, signature: parts[2] ?? "" };
    } catch {
      return { error: "Não foi possível decodificar: o header ou o payload não é Base64URL/JSON válido." };
    }
  }, [token]);

  // Renderização só no cliente: "agora" não precisa bater com o servidor.
  const [now] = useState(() => Date.now() / 1000);

  return (
    <div className="space-y-4">
      <Intro title="Decodificador de JWT">
        Mostra o header e o payload de um JSON Web Token e converte datas. A assinatura <strong>não</strong> é verificada:
        não confie no conteúdo só porque ele decodifica.
      </Intro>
      <TextArea label="Token" value={token} onChange={setToken} placeholder="eyJhbGciOi..." rows={4} />
      {decoded && "error" in decoded && <p className="text-sm text-danger">{decoded.error}</p>}
      {decoded && !("error" in decoded) && (
        <div className="space-y-3">
          {decoded.header?.alg === "none" && (
            <p className="rounded-md border border-danger/40 bg-danger/10 p-2 text-sm text-danger">
              Algoritmo &quot;none&quot;: o token não tem assinatura. Servidores nunca deveriam aceitar isso.
            </p>
          )}
          <div className="grid gap-3 md:grid-cols-2">
            <JsonBlock title="Header" data={decoded.header} />
            <JsonBlock title="Payload" data={decoded.payload} />
          </div>
          {Object.keys(TIME_CLAIMS).some((k) => typeof decoded.payload?.[k] === "number") && (
            <dl className="grid gap-2 text-sm sm:grid-cols-2">
              {Object.entries(TIME_CLAIMS)
                .filter(([k]) => typeof decoded.payload?.[k] === "number")
                .map(([k, label]) => {
                  const v = decoded.payload[k] as number;
                  const expired = k === "exp" && v < now;
                  return (
                    <div key={k} className="rounded-md border border-line p-2">
                      <dt className="label mb-0">
                        {label} ({k})
                      </dt>
                      <dd className={expired ? "text-danger" : ""}>
                        {new Date(v * 1000).toLocaleString("pt-BR")}
                        {expired && " — expirado"}
                      </dd>
                    </div>
                  );
                })}
            </dl>
          )}
          <p className="font-mono text-xs text-dim break-all">
            Assinatura: {decoded.signature || "(vazia)"}
          </p>
        </div>
      )}
    </div>
  );
}

function JsonBlock({ title, data }: { title: string; data: unknown }) {
  const text = JSON.stringify(data, null, 2);
  return (
    <div className="rounded-md border border-line bg-bg/60">
      <div className="flex items-center justify-between border-b border-line px-3 py-1.5">
        <span className="font-mono text-xs uppercase tracking-wider text-accent">{title}</span>
        <CopyButton value={text} className="px-2 py-0.5 text-xs" />
      </div>
      <pre className="overflow-x-auto p-3 font-mono text-xs leading-relaxed">{text}</pre>
    </div>
  );
}

/* ───────────────────────── Defang / refang ───────────────────────── */

function Defanger() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<"defang" | "refang">("defang");
  const out = input ? (mode === "defang" ? defang(refang(input)) : refang(input)) : "";

  return (
    <div className="space-y-4">
      <Intro title="Defang / refang de IOCs">
        &quot;Desarme&quot; URLs, domínios, IPs e e-mails antes de colar em relatórios e chats, para que não virem links
        clicáveis — ou reative indicadores desarmados para analisá-los.
      </Intro>
      <Segmented
        value={mode}
        onChange={setMode}
        options={[
          ["defang", "Desarmar (defang)"],
          ["refang", "Reativar (refang)"],
        ]}
      />
      <TextArea
        label="Indicadores (um por linha ou texto livre)"
        value={input}
        onChange={setInput}
        placeholder={mode === "defang" ? "https://malicioso.example.com/payload\n192.168.0.10\nphishing@example.com" : "hxxps[://]malicioso[.]example[.]com"}
        rows={6}
      />
      <Output value={out} multiline />
    </div>
  );
}

/* ───────────────────────── UI compartilhada ───────────────────────── */

function Intro({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-0.5 text-sm text-muted">{children}</p>
    </div>
  );
}

function Segmented<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: [T, string][];
}) {
  return (
    <div className="inline-flex rounded-md border border-line-strong p-0.5">
      {options.map(([v, label]) => (
        <button
          key={v}
          type="button"
          aria-pressed={value === v}
          onClick={() => onChange(v)}
          className={`rounded px-2.5 py-1 text-sm transition ${value === v ? "bg-accent text-bg font-semibold" : "text-muted hover:text-fg"}`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function TextArea({
  label,
  value,
  onChange,
  placeholder,
  rows = 5,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <div>
      <span className="label">{label}</span>
      <textarea
        aria-label={label}
        className="field resize-y"
        rows={rows}
        value={value}
        spellCheck={false}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function Output({
  value,
  multiline,
  placeholder = "O resultado aparece aqui",
  children,
}: {
  value: string;
  multiline?: boolean;
  placeholder?: string;
  children?: React.ReactNode;
}) {
  return (
    <div>
      <span className="label">Resultado</span>
      <div className="rounded-md border border-line bg-bg/60 p-3">
        <pre
          className={`font-mono text-sm ${value ? "text-accent" : "text-dim"} ${multiline ? "max-h-72 overflow-auto whitespace-pre-wrap break-all" : "whitespace-pre-wrap break-all"}`}
        >
          {value || placeholder}
        </pre>
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        <CopyButton value={value} />
        {value && children}
      </div>
    </div>
  );
}

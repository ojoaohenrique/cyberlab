"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIES, TOOL_COUNT } from "@/lib/catalog";
import { TARGET_LABELS, detectType } from "@/lib/pivot";

/* ───────────── Arte ASCII ───────────── */

// O "(@@@)" marca a pupila, que é pintada à parte.
const EYE = [
  "               .,:::::::::::::,.",
  "          .:::''''           '''':::.",
  "       .::''      .-----------.      ''::.",
  "     .::'      .-'   .-----.   '-.      '::.",
  "   .::'       /     /  ___  \\     \\       '::.",
  "  ::'        |     |  (@@@)  |     |        '::",
  "   '::.       \\     \\  '''  /     /       .::'",
  "     '::.      '-.   '-----'   .-'      .::'",
  "       '::..      '-----------'      ..::'",
  "          ':::....           ....:::'",
  "               '':::::::::::::''",
];

// Fonte em pixels 5x7 (I tem 3 colunas). Desenhada em SVG para não depender
// de a fonte do sistema ter caracteres de bloco.
const PIXEL_FONT: Record<string, string[]> = {
  B: ["11110", "10001", "10001", "11110", "10001", "10001", "11110"],
  I: ["111", "010", "010", "010", "010", "010", "111"],
  G: ["01110", "10001", "10000", "10111", "10001", "10001", "01111"],
  J: ["00111", "00010", "00010", "00010", "00010", "10010", "01100"],
  O: ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
  H: ["10001", "10001", "10001", "11111", "10001", "10001", "10001"],
  N: ["10001", "11001", "10101", "10011", "10001", "10001", "10001"],
  " ": ["00", "00", "00", "00", "00", "00", "00"],
};

function pixelCells(text: string) {
  const cells: [number, number][] = [];
  let x = 0;
  for (const ch of text) {
    const g = PIXEL_FONT[ch];
    g.forEach((row, y) => [...row].forEach((bit, dx) => bit === "1" && cells.push([x + dx, y])));
    x += g[0].length + 1;
  }
  return { cells, cols: x - 1 };
}

const BIG_JOHN = pixelCells("BIG JOHN");

function PixelBanner() {
  const S = 10;
  const D = 3; // profundidade da sombra 3D
  const { cells, cols } = BIG_JOHN;
  const w = cols * S + D;
  const h = 7 * S + D;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full max-w-[560px] drop-shadow-[0_0_10px_rgba(255,140,30,0.35)]" aria-hidden>
      <defs>
        <linearGradient id="bj-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffe766" />
          <stop offset="0.5" stopColor="#ffb21f" />
          <stop offset="1" stopColor="#ff6f12" />
        </linearGradient>
      </defs>
      <g fill="#8a3a00">
        {cells.map(([x, y]) => (
          <rect key={`s${x}-${y}`} x={x * S + D} y={y * S + D} width={S} height={S} />
        ))}
      </g>
      <g fill="url(#bj-fill)" stroke="#a84a00" strokeWidth={0.8}>
        {cells.map(([x, y]) => (
          <rect key={`p${x}-${y}`} x={x * S + 0.4} y={y * S + 0.4} width={S - 0.8} height={S - 0.8} />
        ))}
      </g>
    </svg>
  );
}

/* ───────────── Menu ───────────── */

const OPTIONS = [
  { key: "A", href: "/diretorio", label: "DIRETÓRIO DE FERRAMENTAS OSINT", tone: "text-accent" },
  { key: "B", href: "/pivot", label: "INVESTIGAR UM ALVO", tone: "text-accent" },
  { key: "C", href: "/scan", label: "SCANNER DE SITE (RECON PASSIVO)", tone: "text-accent" },
  { key: "D", href: "/lab", label: "LABORATÓRIO (DORKS, HASH, JWT, IOCs)", tone: "text-accent" },
] as const;

const BOOT = [
  `[+] Carregando módulos …`,
  `[i] ${TOOL_COUNT} ferramentas em ${CATEGORIES.length} categorias`,
  `[i] ${Object.keys(TARGET_LABELS).length} tipos de alvo reconhecidos`,
  `[i] 5 utilitários offline no laboratório`,
  `[✓] Sistema pronto.`,
];

export function HomeTerminal() {
  const router = useRouter();
  const [cmd, setCmd] = useState("");
  const [msg, setMsg] = useState<{ text: string; tone: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const run = (raw: string) => {
    const v = raw.trim();
    if (!v) return;
    const opt = OPTIONS.find((o) => o.key === v.toUpperCase());
    if (opt) {
      setMsg({ text: `[+] Abrindo ${opt.label.toLowerCase()} …`, tone: "text-accent" });
      router.push(opt.href);
      return;
    }
    if (/^q(uit)?$|^sair$/i.test(v)) {
      setMsg({ text: "[!] Não dá para fechar o navegador daqui. Bom trabalho! 👁", tone: "text-danger" });
      setCmd("");
      return;
    }
    const type = detectType(v);
    if (/^https?:\/\//i.test(v) || type === "dominio") {
      router.push(`/scan?url=${encodeURIComponent(v)}`);
    } else if (type) {
      router.push(`/pivot?q=${encodeURIComponent(v)}`);
    } else {
      setMsg({ text: `[!] Opção inválida: "${v}". Use A, B, C, D ou cole um alvo.`, tone: "text-danger" });
    }
  };

  // Atalhos de teclado: A–D abrem as opções quando o foco não está num campo.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const el = e.target as HTMLElement;
      if (el.closest("input, textarea, [contenteditable]")) return;
      const opt = OPTIONS.find((o) => o.key === e.key.toUpperCase());
      if (opt) router.push(opt.href);
      else if (e.key === "/" || e.key === "#") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router]);

  return (
    <div className="overflow-hidden rounded-lg border border-line bg-[#020303] shadow-2xl shadow-black/60">
      <div className="flex items-center gap-1.5 border-b border-line bg-panel px-3 py-2">
        <span className="size-3 rounded-full bg-danger/80" />
        <span className="size-3 rounded-full bg-warn/80" />
        <span className="size-3 rounded-full bg-accent/80" />
        <span className="ml-2 truncate font-mono text-xs text-dim">bigjohn@cyber_lab: ~/recon</span>
      </div>

      <div className="relative p-4 font-mono text-[13px] leading-relaxed sm:p-8">
        <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(to_bottom,transparent_0,transparent_2px,rgb(255_255_255/0.018)_3px)]" />

        {/* Cabeçalho: olho + BIG JOHN */}
        <div className="relative flex flex-col items-center gap-6 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
          <pre className="eye shrink-0 text-[8.5px] leading-[1.15] font-bold sm:text-[15px]" aria-hidden>
            {EYE.map((line, i) => {
              const at = line.indexOf("(@@@)");
              if (at < 0) return <span key={i}>{line + "\n"}</span>;
              return (
                <span key={i}>
                  {line.slice(0, at)}(<span className="pupil">●●●</span>){line.slice(at + 5) + "\n"}
                </span>
              );
            })}
          </pre>

          <div className="flex w-full min-w-0 flex-col items-center lg:max-w-[560px] lg:items-start">
            <h1 className="sr-only">BIG JOHN — Cyber Lab</h1>
            <PixelBanner />
            <pre className="mt-1 text-warn/80 text-[11px] leading-tight" aria-hidden>
              {"        |\n        |\n        v"}
            </pre>
            <p className="mt-1 text-center text-[11px] font-bold uppercase tracking-wide text-[#ff8a1f] sm:text-xs lg:text-left">
              Ferramenta de coleta de informações e OSINT
            </p>
            <p className="text-[11px] text-[#ff8a1f] sm:text-xs">------ X · POR BIG JOHN TECH · X ------</p>
            <p className="mt-3 text-center text-[11px] text-[#ffb347] sm:text-xs lg:text-left">
              SIGA NO GITHUB:{" "}
              <a
                href="https://github.com/ojoaohenrique"
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-dotted hover:text-accent"
              >
                https://github.com/ojoaohenrique
              </a>
            </p>
          </div>
        </div>

        {/* Menu + status */}
        <div className="relative mt-10 grid gap-10 lg:grid-cols-2">
          <div>
            <nav aria-label="Menu principal" className="space-y-1">
              {OPTIONS.map((o) => (
                <button
                  key={o.key}
                  type="button"
                  onClick={() => run(o.key)}
                  className="group flex w-full items-start gap-3 rounded px-1 py-0.5 text-left transition hover:bg-accent/10"
                >
                  <span className="text-warn">[{o.key}]</span>
                  <span className={`${o.tone} font-bold group-hover:underline`}>{o.label}</span>
                </button>
              ))}
              <div className="flex gap-3 px-1 py-0.5">
                <span className="text-danger">[Q]</span>
                <span className="font-bold text-danger">SAIR!</span>
              </div>
            </nav>

            <form
              className="mt-6 flex flex-wrap items-center gap-x-2 gap-y-1"
              onSubmit={(e) => {
                e.preventDefault();
                run(cmd);
              }}
            >
              <label htmlFor="cmd" className="font-bold text-warn">
                [#] ESCOLHA UMA OPÇÃO OU COLE UM ALVO:
              </label>
              <span className="flex min-w-40 flex-1 items-center">
                <input
                  id="cmd"
                  ref={inputRef}
                  value={cmd}
                  onChange={(e) => {
                    setCmd(e.target.value);
                    setMsg(null);
                  }}
                  autoComplete="off"
                  spellCheck={false}
                  placeholder="A"
                  className="w-full bg-transparent font-bold text-fg caret-accent outline-none placeholder:text-dim"
                />
              </span>
            </form>
            {msg && <p className={`mt-2 ${msg.tone}`}>{msg.text}</p>}
            <p className="mt-4 text-xs text-dim">
              Dica: aperte <kbd className="text-muted">A</kbd>–<kbd className="text-muted">D</kbd> em qualquer lugar da
              tela. Um domínio ou URL vai para o Scanner; e-mail, IP, hash e outros vão para Investigar.
            </p>
          </div>

          <div>
            <h2 className="font-bold tracking-[0.35em] text-info">STATUS DO SISTEMA</h2>
            <p className="mb-3 text-info" aria-hidden>
              ---------------&gt;
            </p>
            <div className="space-y-0.5">
              {BOOT.map((line, i) => (
                <p
                  key={line}
                  className={`boot ${line.startsWith("[✓]") ? "text-accent" : line.startsWith("[+]") ? "text-fg" : "text-info"}`}
                  style={{ animationDelay: `${0.25 + i * 0.35}s` }}
                >
                  {line}
                </p>
              ))}
            </div>
            <div className="mt-6 space-y-0.5 text-xs">
              {CATEGORIES.slice(0, 8).map((c) => (
                <p key={c.id} className="text-dim">
                  <span className="text-accent">[i]</span> módulo <span className="text-warn">{c.id}</span>{" "}
                  <span className="text-muted">… ok</span>
                </p>
              ))}
              <p className="text-dim">
                <span className="text-accent">[i]</span> +{CATEGORIES.length - 8} módulos …{" "}
                <span className="text-muted">ok</span>
              </p>
            </div>
            <p className="mt-6 text-xs">
              <span className="text-accent">STATUS:</span> <span className="animate-pulse text-accent">ONLINE ●</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

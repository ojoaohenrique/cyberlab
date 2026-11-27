"use client";

import { useMemo, useState } from "react";
import { ChevronRight, ChevronsDownUp, ChevronsUpDown, ExternalLink, Search, Star, X } from "lucide-react";
import { CATEGORIES, TAGS, toolId, type Category, type Tag, type Tool } from "@/lib/catalog";
import { useFavorites } from "@/lib/favorites";
import { CategoryIcon } from "./CategoryIcon";

const TAG_STYLE: Record<Tag, string> = {
  gratuito: "border-accent/40 text-accent",
  pago: "border-warn/40 text-warn",
  cadastro: "border-info/40 text-info",
  local: "border-fuchsia-400/40 text-fuchsia-300",
  web: "border-line-strong text-muted",
};

function normalize(s: string) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

export function Directory() {
  const [query, setQuery] = useState("");
  const [tags, setTags] = useState<Tag[]>([]);
  const [onlyFav, setOnlyFav] = useState(false);
  const [open, setOpen] = useState<Set<string>>(() => new Set());
  const { favorites, toggle } = useFavorites();

  const filtering = query.trim() !== "" || tags.length > 0 || onlyFav;

  const filtered = useMemo(() => {
    const q = normalize(query.trim());
    const match = (t: Tool, cat: Category) => {
      if (onlyFav && !favorites.includes(toolId(t))) return false;
      if (tags.length && !tags.every((tag) => t.tags.includes(tag))) return false;
      if (!q) return true;
      return normalize(`${t.name} ${t.desc} ${t.url} ${cat.name}`).includes(q);
    };
    return CATEGORIES.map((cat) => ({
      ...cat,
      groups: cat.groups
        .map((g) => ({ ...g, tools: g.tools.filter((t) => match(t, cat)) }))
        .filter((g) => g.tools.length > 0),
    })).filter((c) => c.groups.length > 0);
  }, [query, tags, onlyFav, favorites]);

  const total = filtered.reduce((s, c) => s + c.groups.reduce((n, g) => n + g.tools.length, 0), 0);

  const toggleOpen = (id: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const allOpen = open.size >= CATEGORIES.length;

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
      <aside className="space-y-5 lg:sticky lg:top-20 lg:self-start">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-dim" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar ferramenta…"
            aria-label="Buscar ferramenta"
            className="field pl-9"
          />
        </div>

        <div>
          <span className="label">Filtrar por tag</span>
          <div className="flex flex-wrap gap-1.5">
            {TAGS.map((t) => {
              const active = tags.includes(t.id);
              return (
                <button
                  key={t.id}
                  type="button"
                  title={t.hint}
                  aria-pressed={active}
                  onClick={() => setTags((p) => (active ? p.filter((x) => x !== t.id) : [...p, t.id]))}
                  className={`rounded-full border px-2.5 py-1 font-mono text-xs transition ${
                    active ? `${TAG_STYLE[t.id]} bg-panel-2` : "border-line text-muted hover:border-line-strong"
                  }`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            aria-pressed={onlyFav}
            onClick={() => setOnlyFav((v) => !v)}
            className={`btn ${onlyFav ? "border-warn text-warn" : ""}`}
          >
            <Star className={`size-4 ${onlyFav ? "fill-warn" : ""}`} />
            Favoritos ({favorites.length})
          </button>
          {filtering && (
            <button
              type="button"
              className="btn"
              onClick={() => {
                setQuery("");
                setTags([]);
                setOnlyFav(false);
              }}
            >
              <X className="size-4" />
              Limpar
            </button>
          )}
        </div>

        <nav className="hidden lg:block" aria-label="Categorias">
          <span className="label">Categorias</span>
          <ul className="space-y-0.5 text-sm">
            {CATEGORIES.map((c) => (
              <li key={c.id}>
                <a
                  href={`#${c.id}`}
                  onClick={() => setOpen((p) => new Set(p).add(c.id))}
                  className="flex items-center gap-2 rounded px-2 py-1 text-muted hover:bg-panel-2 hover:text-fg"
                >
                  <CategoryIcon name={c.icon} className="size-3.5" />
                  {c.name}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <section aria-label="Árvore de ferramentas">
        <div className="mb-3 flex items-center justify-between gap-2">
          <p className="font-mono text-xs text-muted">
            <span className="text-accent">{total}</span> ferramentas
            {filtering ? " encontradas" : ` em ${CATEGORIES.length} categorias`}
          </p>
          {!filtering && (
            <button
              type="button"
              className="btn"
              onClick={() => setOpen(allOpen ? new Set() : new Set(CATEGORIES.map((c) => c.id)))}
            >
              {allOpen ? <ChevronsDownUp className="size-4" /> : <ChevronsUpDown className="size-4" />}
              {allOpen ? "Recolher tudo" : "Expandir tudo"}
            </button>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="card p-8 text-center text-sm text-muted">
            {onlyFav && favorites.length === 0
              ? "Você ainda não tem favoritos. Clique na estrela de uma ferramenta para salvá-la aqui."
              : "Nenhuma ferramenta encontrada com esses filtros."}
          </div>
        ) : (
          <ul className="space-y-2">
            {filtered.map((cat) => {
              const isOpen = filtering || open.has(cat.id);
              const count = cat.groups.reduce((n, g) => n + g.tools.length, 0);
              return (
                <li key={cat.id} id={cat.id} className="card scroll-mt-20 overflow-hidden">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => toggleOpen(cat.id)}
                    disabled={filtering}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-panel-2 disabled:cursor-default disabled:hover:bg-transparent"
                  >
                    <ChevronRight
                      className={`size-4 shrink-0 text-dim transition-transform ${isOpen ? "rotate-90" : ""}`}
                    />
                    <span className="grid size-8 shrink-0 place-items-center rounded-md bg-panel-2 text-accent">
                      <CategoryIcon name={cat.icon} className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold">{cat.name}</span>
                      <span className="block truncate text-xs text-muted">{cat.summary}</span>
                    </span>
                    <span className="rounded-full bg-panel-2 px-2 py-0.5 font-mono text-xs text-muted">{count}</span>
                  </button>

                  {isOpen && (
                    <div className="border-t border-line px-4 pb-4 pt-2 sm:pl-[3.25rem]">
                      {cat.groups.map((g) => (
                        <div key={g.name} className="mt-3">
                          <h3 className="mb-1.5 font-mono text-[11px] uppercase tracking-wider text-dim">
                            ├─ {g.name}
                          </h3>
                          <ul className="space-y-1 border-l border-line pl-3">
                            {g.tools.map((t) => (
                              <ToolRow
                                key={t.url}
                                tool={t}
                                fav={favorites.includes(toolId(t))}
                                onFav={() => toggle(toolId(t))}
                              />
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

function ToolRow({ tool, fav, onFav }: { tool: Tool; fav: boolean; onFav: () => void }) {
  return (
    <li className="group flex items-start gap-2 rounded-md px-2 py-2 transition hover:bg-panel-2">
      <button
        type="button"
        onClick={onFav}
        aria-pressed={fav}
        aria-label={fav ? `Remover ${tool.name} dos favoritos` : `Adicionar ${tool.name} aos favoritos`}
        className="mt-0.5 shrink-0 text-dim transition hover:text-warn"
      >
        <Star className={`size-4 ${fav ? "fill-warn text-warn" : ""}`} />
      </button>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <a
            href={tool.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-medium text-fg hover:text-accent"
          >
            {tool.name}
            <ExternalLink className="size-3 opacity-50" />
          </a>
          {tool.tags.map((tag) => (
            <span key={tag} className={`rounded border px-1.5 font-mono text-[10px] leading-4 ${TAG_STYLE[tag]}`}>
              {tag}
            </span>
          ))}
        </div>
        <p className="mt-0.5 text-sm leading-snug text-muted">{tool.desc}</p>
      </div>
    </li>
  );
}

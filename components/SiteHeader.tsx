"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Crosshair, FlaskConical, FolderTree, Radar, Terminal } from "lucide-react";

const NAV = [
  { href: "/diretorio", label: "Diretório", short: "Diretório", icon: FolderTree },
  { href: "/pivot", label: "Investigar", short: "Investigar", icon: Crosshair },
  { href: "/scan", label: "Scanner", short: "Scanner", icon: Radar },
  { href: "/lab", label: "Laboratório", short: "Lab", icon: FlaskConical },
];

export function SiteHeader() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-bg/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2 font-mono text-sm font-bold">
          <span className="grid size-7 place-items-center rounded-md bg-accent-dim text-accent">
            <Terminal className="size-4" />
          </span>
          <span className="hidden sm:inline">
            cyber<span className="text-accent">_lab</span>
          </span>
        </Link>
        <nav className="ml-auto flex gap-1">
          {NAV.map(({ href, label, short, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-1.5 rounded-md px-1.5 py-1.5 text-[13px] transition sm:px-2.5 sm:text-sm ${
                  active ? "bg-accent-dim text-accent" : "text-muted hover:bg-panel-2 hover:text-fg"
                }`}
              >
                <Icon className="hidden size-4 sm:block" />
                <span className="sm:hidden">{short}</span>
                <span className="hidden sm:inline">{label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

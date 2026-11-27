import { promises as dns } from "node:dns";
import net from "node:net";
import type { NextRequest } from "next/server";

/**
 * Varredura passiva de um site: uma requisição GET como a de um navegador,
 * mais robots.txt, DNS e geolocalização do IP. Bloqueia endereços internos
 * (proteção contra SSRF) para que a rota não sirva de ponte para a rede local.
 */

const TIMEOUT_MS = 8000;
const MAX_BODY = 512 * 1024;
const MAX_REDIRECTS = 5;
const UA = "Mozilla/5.0 (compatible; CyberLab-Scanner/1.0)";

// Resolver público para registros (MX, NS, TXT…): o resolver do sistema nem sempre responde a esses tipos.
const resolver = new dns.Resolver({ timeout: 4000, tries: 2 });
resolver.setServers(["1.1.1.1", "8.8.8.8"]);

const SECURITY_HEADERS: [string, string][] = [
  ["strict-transport-security", "Força HTTPS (HSTS)"],
  ["content-security-policy", "Restringe scripts e recursos (CSP)"],
  ["x-frame-options", "Impede embutir a página (clickjacking)"],
  ["x-content-type-options", "Impede o navegador de adivinhar tipos (nosniff)"],
  ["referrer-policy", "Controla o envio do Referer"],
  ["permissions-policy", "Limita câmera, microfone, geolocalização…"],
];

const CMS_SIGNATURES: [string, RegExp][] = [
  ["WordPress", /wp-content|wp-includes|wp-json/i],
  ["Joomla", /\/media\/jui\/|joomla/i],
  ["Drupal", /drupal-settings-json|\/sites\/default\/files|Drupal\.settings/i],
  ["Shopify", /cdn\.shopify\.com|Shopify\.theme/i],
  ["Wix", /static\.wixstatic\.com|wix\.com/i],
  ["Squarespace", /squarespace\.com|static1\.squarespace/i],
  ["Ghost", /ghost-(?:url|portal)|content="Ghost/i],
  ["Magento", /Mage\.Cookies|\/static\/version\d+\/frontend\//i],
  ["PrestaShop", /prestashop/i],
  ["Blogger", /blogger\.com|blogspot\.com/i],
  ["Webflow", /webflow\.(?:com|io)|data-wf-page/i],
  ["Next.js", /\/_next\/static|__NEXT_DATA__/],
  ["Nuxt", /\/_nuxt\/|__NUXT__/],
  ["Gatsby", /___gatsby/],
];

function isPrivateIp(ip: string): boolean {
  if (net.isIPv4(ip)) {
    const [a, b] = ip.split(".").map(Number);
    return (
      a === 0 ||
      a === 10 ||
      a === 127 ||
      (a === 100 && b >= 64 && b <= 127) ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      (a === 198 && (b === 18 || b === 19)) ||
      a >= 224
    );
  }
  const v6 = ip.toLowerCase();
  if (v6.startsWith("::ffff:")) return isPrivateIp(v6.slice(7));
  return v6 === "::" || v6 === "::1" || /^f[cd]/.test(v6) || /^fe[89ab]/.test(v6);
}

class ScanError extends Error {}

async function resolvePublic(hostname: string): Promise<string[]> {
  const host = hostname.replace(/^\[|\]$/g, "");
  const addrs = net.isIP(host) ? [host] : (await dns.lookup(host, { all: true })).map((a) => a.address);
  if (addrs.length === 0) throw new ScanError("O domínio não resolve para nenhum IP.");
  if (addrs.some(isPrivateIp)) throw new ScanError("Endereços internos ou reservados não podem ser varridos.");
  return addrs;
}

async function readLimited(res: Response): Promise<string> {
  if (!res.body) return "";
  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (size < MAX_BODY) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    size += value.length;
  }
  reader.cancel().catch(() => {});
  const all = new Uint8Array(Math.min(size, MAX_BODY));
  let off = 0;
  for (const c of chunks) {
    const part = c.subarray(0, all.length - off);
    all.set(part, off);
    off += part.length;
    if (off >= all.length) break;
  }
  return new TextDecoder("utf-8", { fatal: false }).decode(all);
}

/** GET que segue redirecionamentos manualmente, validando cada destino. */
async function safeFetch(start: URL) {
  let url = start;
  const chain: { url: string; status: number }[] = [];
  for (let i = 0; i <= MAX_REDIRECTS; i++) {
    await resolvePublic(url.hostname);
    const res = await fetch(url, {
      redirect: "manual",
      headers: { "user-agent": UA, accept: "text/html,*/*;q=0.8" },
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: "no-store",
    });
    const loc = res.headers.get("location");
    if (res.status >= 300 && res.status < 400 && loc) {
      chain.push({ url: url.toString(), status: res.status });
      res.body?.cancel().catch(() => {});
      url = new URL(loc, url);
      if (!/^https?:$/.test(url.protocol)) throw new ScanError("Redirecionamento para protocolo não suportado.");
      continue;
    }
    return { res, finalUrl: url, chain };
  }
  throw new ScanError("Redirecionamentos demais.");
}

async function settle<T>(p: Promise<T>): Promise<T | null> {
  try {
    return await p;
  } catch {
    return null;
  }
}

function decodeEntities(s: string) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
}

export async function GET(request: NextRequest) {
  const raw = (request.nextUrl.searchParams.get("url") ?? "").trim();
  if (!raw) return Response.json({ error: "Informe um site." }, { status: 400 });

  let target: URL;
  try {
    target = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
    if (!/^https?:$/.test(target.protocol)) throw new Error();
  } catch {
    return Response.json({ error: "URL inválida." }, { status: 400 });
  }

  const started = Date.now();
  try {
    const ips = await resolvePublic(target.hostname);
    const { res, finalUrl, chain } = await safeFetch(target);
    const html = await readLimited(res);
    const headers = Object.fromEntries([...res.headers.entries()].sort(([a], [b]) => a.localeCompare(b)));

    const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim().replace(/\s+/g, " ");
    const generator = html.match(/<meta[^>]+name=["']generator["'][^>]+content=["']([^"']+)/i)?.[1];
    const description = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)/i)?.[1];
    const cms = [
      ...(generator ? [generator] : []),
      ...CMS_SIGNATURES.filter(([name, re]) => re.test(html) && !generator?.toLowerCase().includes(name.toLowerCase())).map(
        ([name]) => name,
      ),
    ];
    const server = res.headers.get("server");
    const cloudflare = /cloudflare/i.test(server ?? "") || res.headers.has("cf-ray");

    const host = finalUrl.hostname;
    const ip = ips[0];
    const [robots, geo, mx, ns, txt, aaaa] = await Promise.all([
      settle(
        (async () => {
          const r = await safeFetch(new URL("/robots.txt", finalUrl));
          const body = await readLimited(r.res);
          const ok = r.res.ok && !/<html/i.test(body.slice(0, 500));
          return ok ? body.slice(0, 4000) : null;
        })(),
      ),
      settle(
        (async () => {
          const r = await fetch(`https://ipinfo.io/${encodeURIComponent(ip)}/json`, {
            headers: { accept: "application/json" },
            signal: AbortSignal.timeout(TIMEOUT_MS),
          });
          if (!r.ok) return null;
          return (await r.json()) as Record<string, string>;
        })(),
      ),
      settle(resolver.resolveMx(host)),
      settle(resolver.resolveNs(host)),
      settle(resolver.resolveTxt(host)),
      settle(resolver.resolve6(host)),
    ]);

    return Response.json({
      target: target.toString(),
      finalUrl: finalUrl.toString(),
      redirects: chain,
      status: res.status,
      statusText: res.statusText,
      elapsedMs: Date.now() - started,
      basic: {
        title: title ? decodeEntities(title) : null,
        description: description ? decodeEntities(description) : null,
        ips,
        server,
        poweredBy: res.headers.get("x-powered-by"),
        cms,
        cloudflare,
        robots,
      },
      headers,
      security: SECURITY_HEADERS.map(([name, desc]) => ({ name, desc, value: res.headers.get(name) })),
      geo: geo
        ? {
            ip: geo.ip ?? ip,
            hostname: geo.hostname ?? null,
            city: geo.city ?? null,
            region: geo.region ?? null,
            country: geo.country ?? null,
            loc: geo.loc ?? null,
            org: geo.org ?? null,
            timezone: geo.timezone ?? null,
          }
        : { ip },
      dns: {
        a: ips.filter((x) => net.isIPv4(x)),
        aaaa: aaaa ?? [],
        mx: (mx ?? []).sort((a, b) => a.priority - b.priority).map((m) => `${m.priority} ${m.exchange}`),
        ns: ns ?? [],
        txt: (txt ?? []).map((t) => t.join("")),
      },
    });
  } catch (err) {
    const message =
      err instanceof ScanError
        ? err.message
        : err instanceof Error && err.name === "TimeoutError"
          ? "O site demorou demais para responder."
          : err instanceof Error && /ENOTFOUND|EAI_AGAIN/.test(String((err as NodeJS.ErrnoException).code ?? err.message))
            ? "Domínio não encontrado."
            : "Não foi possível conectar ao site.";
    return Response.json({ error: message }, { status: 422 });
  }
}

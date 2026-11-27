/**
 * Detecção do tipo de alvo e geração de links de investigação ("pivôs").
 * Só entram templates de URL conhecidos e estáveis; quando não existe um,
 * a ferramenta aparece sem link preenchido (só a página inicial) ou como
 * comando para rodar localmente.
 */

export type TargetType =
  | "url"
  | "email"
  | "ipv4"
  | "ipv6"
  | "dominio"
  | "hash"
  | "btc"
  | "eth"
  | "tron"
  | "cnpj"
  | "telefone"
  | "username";

export const TARGET_LABELS: Record<TargetType, string> = {
  url: "URL",
  email: "E-mail",
  ipv4: "IPv4",
  ipv6: "IPv6",
  dominio: "Domínio",
  hash: "Hash",
  btc: "Carteira Bitcoin",
  eth: "Carteira Ethereum/EVM",
  tron: "Carteira TRON",
  cnpj: "CNPJ",
  telefone: "Telefone",
  username: "Username",
};

export interface PivotLink {
  name: string;
  /** Link já preenchido com o alvo. */
  href?: string;
  /** Comando para rodar localmente, quando a ferramenta é CLI. */
  command?: string;
  note?: string;
}

export interface PivotSection {
  title: string;
  links: PivotLink[];
}

/** Desfaz a "desarmação" comum de indicadores (hxxp, [.], [@] ...). */
export function refang(input: string): string {
  return input
    .trim()
    .replace(/\bhxxp(s?)/gi, "http$1")
    .replace(/\bfxp\b/gi, "ftp")
    .replace(/\[:\/\/\]/g, "://")
    .replace(/\[\s*\.\s*\]|\(\s*\.\s*\)|\{\s*\.\s*\}|\[dot\]|\(dot\)/gi, ".")
    .replace(/\[\s*@\s*\]|\(\s*@\s*\)|\[at\]|\(at\)/gi, "@")
    .replace(/\[:\]/g, ":")
    .replace(/\[\/\]/g, "/");
}

/** Desarma um indicador para poder colá-lo sem virar link clicável. */
export function defang(input: string): string {
  return input
    .replace(/http(s?):\/\//gi, "hxxp$1[://]")
    .replace(/ftp:\/\//gi, "fxp[://]")
    .replace(/@/g, "[@]")
    .replace(/\.(?=[^\s.\]]+)/g, "[.]");
}

const RE = {
  url: /^(https?|ftp):\/\/[^\s]+$/i,
  email: /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i,
  ipv4: /^(25[0-5]|2[0-4]\d|1?\d?\d)(\.(25[0-5]|2[0-4]\d|1?\d?\d)){3}$/,
  ipv6: /^(?=.*:)[0-9a-f:]{2,39}$/i,
  hash: /^([a-f0-9]{32}|[a-f0-9]{40}|[a-f0-9]{64}|[a-f0-9]{128})$/i,
  eth: /^0x[a-f0-9]{40}$/i,
  btc: /^(bc1[a-z0-9]{25,62}|[13][a-km-zA-HJ-NP-Z1-9]{25,34})$/,
  tron: /^T[1-9A-HJ-NP-Za-km-z]{33}$/,
  cnpj: /^\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}$/,
  telefone: /^\+?[\d\s().-]{8,20}$/,
  dominio: /^(?=.{3,253}$)([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i,
  username: /^@?[\w.-]{2,40}$/,
};

/** Retorna o tipo mais provável do alvo (já com refang aplicado). */
export function detectType(raw: string): TargetType | null {
  const v = refang(raw);
  if (!v) return null;
  if (RE.url.test(v)) return "url";
  if (RE.email.test(v)) return "email";
  if (RE.ipv4.test(v)) return "ipv4";
  if (RE.eth.test(v)) return "eth";
  if (RE.hash.test(v)) return "hash";
  if (RE.ipv6.test(v) && v.split(":").length >= 3) return "ipv6";
  if (RE.cnpj.test(v) && /[./-]/.test(v)) return "cnpj";
  if (/^\d{14}$/.test(v) && isValidCnpj(v)) return "cnpj";
  if (RE.tron.test(v)) return "tron";
  if (RE.btc.test(v) && !RE.dominio.test(v)) return "btc";
  if (RE.telefone.test(v) && v.replace(/\D/g, "").length >= 8) return "telefone";
  if (RE.dominio.test(v)) return "dominio";
  if (RE.username.test(v)) return "username";
  return null;
}

export function isValidCnpj(value: string): boolean {
  const d = value.replace(/\D/g, "");
  if (d.length !== 14 || /^(\d)\1+$/.test(d)) return false;
  const calc = (len: number) => {
    const weights = len === 12 ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const sum = weights.reduce((acc, w, i) => acc + Number(d[i]) * w, 0);
    const r = sum % 11;
    return r < 2 ? 0 : 11 - r;
  };
  return calc(12) === Number(d[12]) && calc(13) === Number(d[13]);
}

export function hashKind(h: string): string {
  return { 32: "MD5", 40: "SHA-1", 64: "SHA-256", 128: "SHA-512" }[h.length] ?? "hash";
}

const e = encodeURIComponent;
const google = (q: string) => `https://www.google.com/search?q=${e(q)}`;

function domainSections(d: string): PivotSection[] {
  const isBr = /\.br$/i.test(d);
  return [
    {
      title: "Registro e DNS",
      links: [
        isBr
          ? { name: "Registro.br (WHOIS .br)", href: "https://registro.br/", note: "Cole o domínio no campo de busca." }
          : { name: "ICANN Lookup (WHOIS/RDAP)", href: `https://lookup.icann.org/en/lookup?name=${e(d)}` },
        { name: "ViewDNS WHOIS", href: `https://viewdns.info/whois/?domain=${e(d)}` },
        { name: "MXToolbox (MX)", href: `https://mxtoolbox.com/SuperTool.aspx?action=mx%3a${e(d)}&run=toolpage` },
        { name: "SecurityTrails (histórico DNS)", href: `https://securitytrails.com/domain/${e(d)}/dns` },
        { name: "DNSDumpster", href: "https://dnsdumpster.com/", note: "Cole o domínio no campo de busca." },
      ],
    },
    {
      title: "Subdomínios e certificados",
      links: [
        { name: "crt.sh (Certificate Transparency)", href: `https://crt.sh/?q=${e(`%.${d}`)}` },
        { name: "Subfinder", command: `subfinder -d ${d}` },
        { name: "Amass", command: `amass enum -passive -d ${d}` },
        { name: "theHarvester", command: `theHarvester -d ${d} -b all` },
      ],
    },
    {
      title: "Reputação e varredura",
      links: [
        { name: "VirusTotal", href: `https://www.virustotal.com/gui/domain/${e(d)}` },
        { name: "urlscan.io", href: `https://urlscan.io/domain/${e(d)}` },
        { name: "AlienVault OTX", href: `https://otx.alienvault.com/indicator/domain/${e(d)}` },
        { name: "Shodan (hostname)", href: `https://www.shodan.io/search?query=${e(`hostname:${d}`)}` },
        { name: "BuiltWith (tecnologias)", href: `https://builtwith.com/${e(d)}` },
      ],
    },
    {
      title: "Histórico e buscas",
      links: [
        { name: "Wayback Machine", href: `https://web.archive.org/web/*/${d}*` },
        { name: "archive.today", href: `https://archive.ph/${d}` },
        { name: "Google: site:", href: google(`site:${d}`) },
        { name: "Google: documentos expostos", href: google(`site:${d} (filetype:pdf OR filetype:docx OR filetype:xlsx OR filetype:csv)`) },
        { name: "GitHub Code Search", href: `https://github.com/search?type=code&q=${e(`"${d}"`)}` },
      ],
    },
  ];
}

function ipSections(ip: string): PivotSection[] {
  return [
    {
      title: "Exposição e serviços",
      links: [
        { name: "Shodan", href: `https://www.shodan.io/host/${e(ip)}` },
        { name: "urlscan.io", href: `https://urlscan.io/ip/${e(ip)}` },
        { name: "Nmap", command: `nmap -sV -Pn ${ip}`, note: "Só em alvos que você tem autorização para varrer." },
      ],
    },
    {
      title: "Reputação",
      links: [
        { name: "AbuseIPDB", href: `https://www.abuseipdb.com/check/${e(ip)}` },
        { name: "VirusTotal", href: `https://www.virustotal.com/gui/ip-address/${e(ip)}` },
        { name: "GreyNoise", href: `https://viz.greynoise.io/ip/${e(ip)}` },
        { name: "AlienVault OTX", href: `https://otx.alienvault.com/indicator/ip/${e(ip)}` },
      ],
    },
    {
      title: "Rede e geolocalização",
      links: [
        { name: "IPinfo", href: `https://ipinfo.io/${e(ip)}` },
        { name: "Hurricane Electric BGP", href: `https://bgp.he.net/ip/${e(ip)}` },
        { name: "RIPEstat", href: `https://stat.ripe.net/${e(ip)}` },
        { name: "ViewDNS (IP reverso)", href: `https://viewdns.info/reverseip/?host=${e(ip)}&t=1` },
      ],
    },
  ];
}

export function buildPivots(type: TargetType, raw: string): PivotSection[] {
  const v = refang(raw);

  switch (type) {
    case "dominio":
      return domainSections(v.toLowerCase());

    case "ipv4":
    case "ipv6":
      return ipSections(v);

    case "url": {
      let host = "";
      try {
        host = new URL(v).hostname;
      } catch {
        /* URL inválida: segue sem o host */
      }
      const sections: PivotSection[] = [
        {
          title: "Análise da URL",
          links: [
            { name: "VirusTotal (busca)", href: `https://www.virustotal.com/gui/search/${e(e(v))}` },
            { name: "urlscan.io (busca)", href: `https://urlscan.io/search/#${e(`page.url:"${v}"`)}` },
            { name: "Wayback Machine", href: `https://web.archive.org/web/*/${v}` },
            { name: "archive.today", href: `https://archive.ph/${v}` },
          ],
        },
        {
          title: "Se for uma imagem: busca reversa",
          links: [
            { name: "Google Lens", href: `https://lens.google.com/uploadbyurl?url=${e(v)}` },
            { name: "TinEye", href: `https://tineye.com/search?url=${e(v)}` },
            { name: "Yandex Imagens", href: `https://yandex.com/images/search?rpt=imageview&url=${e(v)}` },
            { name: "Bing Visual Search", href: `https://www.bing.com/images/search?view=detailv2&iss=sbi&q=imgurl:${e(v)}` },
          ],
        },
      ];
      if (host) {
        const hostType = RE.ipv4.test(host) ? "ipv4" : "dominio";
        const extra = hostType === "ipv4" ? ipSections(host) : domainSections(host);
        sections.push(...extra.map((s) => ({ ...s, title: `${s.title} — ${host}` })));
      }
      return sections;
    }

    case "email": {
      const domain = v.split("@")[1]?.toLowerCase() ?? "";
      return [
        {
          title: "Verificação e contas",
          links: [
            { name: "Hunter (verificador)", href: `https://hunter.io/email-verifier/${e(v)}` },
            { name: "Epieos", href: "https://epieos.com/", note: "Cole o e-mail no campo de busca." },
            { name: "Holehe", command: `holehe ${v}` },
            { name: "GHunt (contas Google)", command: `ghunt email ${v}` },
          ],
        },
        {
          title: "Vazamentos",
          links: [
            { name: "Have I Been Pwned", href: "https://haveibeenpwned.com/", note: "Cole o e-mail no campo de busca." },
            { name: "Intelligence X", href: `https://intelx.io/?s=${e(v)}` },
          ],
        },
        {
          title: "Pegadas na web",
          links: [
            { name: "Google: e-mail exato", href: google(`"${v}"`) },
            { name: "GitHub Code Search", href: `https://github.com/search?type=code&q=${e(`"${v}"`)}` },
            { name: `Domínio do e-mail (${domain})`, href: `/pivot?q=${e(domain)}`, note: "Abre a investigação do domínio." },
            { name: "MXToolbox (MX do domínio)", href: `https://mxtoolbox.com/SuperTool.aspx?action=mx%3a${e(domain)}&run=toolpage` },
          ],
        },
      ];
    }

    case "hash": {
      const kind = hashKind(v);
      const links: PivotLink[] = [
        { name: "VirusTotal", href: `https://www.virustotal.com/gui/file/${e(v)}` },
        { name: "Hybrid Analysis", href: `https://www.hybrid-analysis.com/search?query=${e(v)}` },
        { name: "AlienVault OTX", href: `https://otx.alienvault.com/indicator/file/${e(v)}` },
      ];
      if (kind === "SHA-256" || kind === "SHA-1" || kind === "MD5") {
        const prefix = kind === "SHA-256" ? "sha256" : kind === "SHA-1" ? "sha1" : "md5";
        links.push({ name: "MalwareBazaar", href: `https://bazaar.abuse.ch/browse.php?search=${e(`${prefix}:${v}`)}` });
      }
      links.push({ name: "Google: hash exato", href: google(`"${v}"`) });
      return [{ title: `Reputação do arquivo (${kind})`, links }];
    }

    case "btc":
      return [
        {
          title: "Exploradores Bitcoin",
          links: [
            { name: "mempool.space", href: `https://mempool.space/address/${e(v)}` },
            { name: "Blockchair", href: `https://blockchair.com/bitcoin/address/${e(v)}` },
            { name: "Blockchain.com", href: `https://www.blockchain.com/explorer/addresses/btc/${e(v)}` },
            { name: "WalletExplorer (atribuição)", href: `https://www.walletexplorer.com/address/${e(v)}` },
            { name: "Arkham Intelligence", href: `https://intel.arkm.com/explorer/address/${e(v)}` },
            { name: "Google: endereço exato", href: google(`"${v}"`) },
          ],
        },
      ];

    case "eth":
      return [
        {
          title: "Exploradores Ethereum / EVM",
          links: [
            { name: "Etherscan", href: `https://etherscan.io/address/${e(v)}` },
            { name: "Blockchair", href: `https://blockchair.com/ethereum/address/${e(v)}` },
            { name: "Arkham Intelligence", href: `https://intel.arkm.com/explorer/address/${e(v)}` },
            { name: "Google: endereço exato", href: google(`"${v}"`) },
          ],
        },
      ];

    case "tron":
      return [
        {
          title: "Exploradores TRON",
          links: [
            { name: "Tronscan", href: `https://tronscan.org/#/address/${e(v)}` },
            { name: "Arkham Intelligence", href: `https://intel.arkm.com/explorer/address/${e(v)}` },
            { name: "Google: endereço exato", href: google(`"${v}"`) },
          ],
        },
      ];

    case "cnpj": {
      const digits = v.replace(/\D/g, "");
      const formatted = digits.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
      return [
        {
          title: "Dados da empresa",
          links: [
            { name: "BrasilAPI (JSON)", href: `https://brasilapi.com.br/api/cnpj/v1/${digits}` },
            { name: "Casa dos Dados", href: "https://casadosdados.com.br/", note: "Cole o CNPJ no campo de busca." },
            { name: "Portal da Transparência", href: "https://portaldatransparencia.gov.br/", note: "Sanções, contratos e convênios." },
          ],
        },
        {
          title: "Processos e publicações",
          links: [
            { name: "Jusbrasil", href: `https://www.jusbrasil.com.br/busca?q=${e(formatted)}` },
            { name: "Querido Diário", href: "https://queridodiario.ok.org.br/", note: "Busca em diários oficiais municipais." },
            { name: "Google: CNPJ exato", href: google(`"${formatted}"`) },
          ],
        },
      ];
    }

    case "telefone": {
      const digits = v.replace(/\D/g, "");
      return [
        {
          title: "Consulta",
          links: [
            { name: "WhatsApp (wa.me)", href: `https://wa.me/${digits}`, note: "Mostra se o número tem WhatsApp. Inclua o DDI (55 no Brasil)." },
            { name: "PhoneInfoga", command: `phoneinfoga scan -n "+${digits}"` },
            { name: "Truecaller", href: "https://www.truecaller.com/", note: "Exige login." },
            { name: "Sync.me", href: "https://sync.me/" },
          ],
        },
        {
          title: "Pegadas na web",
          links: [
            { name: "Google: número exato", href: google(`"${v}" OR "${digits}"`) },
          ],
        },
      ];
    }

    case "username": {
      const u = v.replace(/^@/, "");
      return [
        {
          title: "Busca em massa",
          links: [
            { name: "WhatsMyName", href: `https://whatsmyname.app/?q=${e(u)}` },
            { name: "Sherlock", command: `sherlock ${u}` },
            { name: "Maigret", command: `maigret ${u}` },
          ],
        },
        {
          title: "Perfis diretos",
          links: [
            { name: "GitHub", href: `https://github.com/${e(u)}` },
            { name: "X (Twitter)", href: `https://x.com/${e(u)}` },
            { name: "Instagram", href: `https://www.instagram.com/${e(u)}/` },
            { name: "TikTok", href: `https://www.tiktok.com/@${e(u)}` },
            { name: "YouTube", href: `https://www.youtube.com/@${e(u)}` },
            { name: "Reddit", href: `https://www.reddit.com/user/${e(u)}` },
            { name: "Telegram", href: `https://t.me/${e(u)}` },
          ],
        },
        {
          title: "Pegadas na web",
          links: [{ name: "Google: username exato", href: google(`"${u}"`) }],
        },
      ];
    }
  }
}

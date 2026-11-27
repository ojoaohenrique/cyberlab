/**
 * Catálogo de ferramentas OSINT do Cyber Lab.
 *
 * Estrutura: categoria → grupo → ferramenta. Para adicionar uma ferramenta,
 * inclua um objeto em `tools` do grupo certo. O `id` de cada ferramenta é
 * gerado a partir da URL, então mantenha as URLs únicas.
 */

export type Tag = "gratuito" | "pago" | "cadastro" | "local" | "web";

export const TAGS: { id: Tag; label: string; hint: string }[] = [
  { id: "gratuito", label: "Gratuito", hint: "Uso gratuito (às vezes com limite)" },
  { id: "pago", label: "Pago", hint: "Plano pago para recursos principais" },
  { id: "cadastro", label: "Cadastro", hint: "Exige conta ou chave de API" },
  { id: "local", label: "Local", hint: "Roda na sua máquina (CLI ou app)" },
  { id: "web", label: "Web", hint: "Usa direto no navegador" },
];

export interface Tool {
  name: string;
  url: string;
  desc: string;
  tags: Tag[];
}

export interface Group {
  name: string;
  tools: Tool[];
}

export interface Category {
  id: string;
  name: string;
  icon: CategoryIcon;
  summary: string;
  groups: Group[];
}

export type CategoryIcon =
  | "user"
  | "mail"
  | "globe"
  | "network"
  | "phone"
  | "image"
  | "map"
  | "archive"
  | "leak"
  | "code"
  | "building"
  | "bitcoin"
  | "plane"
  | "onion"
  | "shield"
  | "terminal";

export const CATEGORIES: Category[] = [
  {
    id: "usuario",
    name: "Usuário e redes sociais",
    icon: "user",
    summary: "Descobrir em quais plataformas um username existe.",
    groups: [
      {
        name: "Busca de username",
        tools: [
          { name: "WhatsMyName", url: "https://whatsmyname.app/", desc: "Verifica um username em centenas de sites a partir de uma lista aberta e mantida pela comunidade.", tags: ["gratuito", "web"] },
          { name: "Namechk", url: "https://namechk.com/", desc: "Checa a disponibilidade de um nome em redes sociais e domínios.", tags: ["gratuito", "web"] },
          { name: "Instant Username Search", url: "https://instantusername.com/", desc: "Busca rápida de username em redes sociais populares, com resultado em tempo real.", tags: ["gratuito", "web"] },
        ],
      },
      {
        name: "Ferramentas locais",
        tools: [
          { name: "Sherlock", url: "https://github.com/sherlock-project/sherlock", desc: "CLI em Python que procura um username em centenas de redes sociais.", tags: ["gratuito", "local"] },
          { name: "Maigret", url: "https://github.com/soxoj/maigret", desc: "Evolução do Sherlock: busca em milhares de sites, extrai dados dos perfis e gera relatório.", tags: ["gratuito", "local"] },
          { name: "Social Analyzer", url: "https://github.com/qeeqbox/social-analyzer", desc: "API, CLI e interface web para encontrar perfis de uma pessoa em mais de mil sites.", tags: ["gratuito", "local"] },
        ],
      },
    ],
  },
  {
    id: "email",
    name: "E-mail",
    icon: "mail",
    summary: "Validar endereços, achar padrões e contas ligadas a um e-mail.",
    groups: [
      {
        name: "Busca e verificação",
        tools: [
          { name: "Hunter", url: "https://hunter.io/", desc: "Encontra e-mails corporativos de um domínio e verifica se um endereço é entregável.", tags: ["cadastro", "web"] },
          { name: "Epieos", url: "https://epieos.com/", desc: "Busca reversa de e-mail e telefone: contas Google, serviços vinculados e mais.", tags: ["gratuito", "pago", "web"] },
          { name: "MXToolbox", url: "https://mxtoolbox.com/", desc: "Consulta MX, SPF, DKIM, DMARC e listas negras do domínio de um e-mail.", tags: ["gratuito", "web"] },
        ],
      },
      {
        name: "Ferramentas locais",
        tools: [
          { name: "Holehe", url: "https://github.com/megadose/holehe", desc: "Verifica em quais sites um e-mail tem conta usando a função de recuperação de senha, sem alertar o alvo.", tags: ["gratuito", "local"] },
          { name: "GHunt", url: "https://github.com/mxrch/GHunt", desc: "Investiga contas Google a partir do e-mail: serviços usados, avaliações no Maps e mais.", tags: ["gratuito", "local"] },
        ],
      },
    ],
  },
  {
    id: "dominio",
    name: "Domínio e sites",
    icon: "globe",
    summary: "WHOIS, DNS, subdomínios, certificados e tecnologias de um site.",
    groups: [
      {
        name: "WHOIS e registro",
        tools: [
          { name: "Registro.br", url: "https://registro.br/", desc: "Registro oficial dos domínios .br, com consulta WHOIS de titular e servidores DNS.", tags: ["gratuito", "web"] },
          { name: "ICANN Lookup", url: "https://lookup.icann.org/", desc: "Consulta RDAP/WHOIS oficial da ICANN para domínios genéricos.", tags: ["gratuito", "web"] },
          { name: "ViewDNS.info", url: "https://viewdns.info/", desc: "Coleção de consultas: WHOIS reverso, IP reverso, histórico de IP, DNS e mais.", tags: ["gratuito", "web"] },
        ],
      },
      {
        name: "DNS e subdomínios",
        tools: [
          { name: "crt.sh", url: "https://crt.sh/", desc: "Busca em logs de Certificate Transparency: ótimo para descobrir subdomínios.", tags: ["gratuito", "web"] },
          { name: "DNSDumpster", url: "https://dnsdumpster.com/", desc: "Mapeia registros DNS e subdomínios de um domínio com visualização gráfica.", tags: ["gratuito", "web"] },
          { name: "SecurityTrails", url: "https://securitytrails.com/", desc: "Histórico de DNS, subdomínios e WHOIS ao longo do tempo.", tags: ["cadastro", "web"] },
        ],
      },
      {
        name: "Tecnologia e varredura",
        tools: [
          { name: "urlscan.io", url: "https://urlscan.io/", desc: "Acessa a página num navegador isolado e mostra requisições, IPs, capturas e tecnologias.", tags: ["gratuito", "web"] },
          { name: "BuiltWith", url: "https://builtwith.com/", desc: "Identifica CMS, analytics, CDN e outras tecnologias usadas por um site.", tags: ["gratuito", "pago", "web"] },
          { name: "Wappalyzer", url: "https://www.wappalyzer.com/", desc: "Extensão e serviço que detectam a stack tecnológica de sites.", tags: ["gratuito", "pago", "web"] },
        ],
      },
      {
        name: "Ferramentas locais",
        tools: [
          { name: "Amass", url: "https://github.com/owasp-amass/amass", desc: "Projeto OWASP para mapeamento de superfície de ataque e enumeração de subdomínios.", tags: ["gratuito", "local"] },
          { name: "Subfinder", url: "https://github.com/projectdiscovery/subfinder", desc: "Enumeração passiva de subdomínios, rápida e com várias fontes.", tags: ["gratuito", "local"] },
        ],
      },
    ],
  },
  {
    id: "ip-rede",
    name: "IP e rede",
    icon: "network",
    summary: "Geolocalização, ASN, portas expostas e reputação de IPs.",
    groups: [
      {
        name: "Mecanismos de busca de dispositivos",
        tools: [
          { name: "Shodan", url: "https://www.shodan.io/", desc: "Busca dispositivos e serviços expostos na internet, com banners, portas e vulnerabilidades.", tags: ["cadastro", "pago", "web"] },
          { name: "Censys", url: "https://censys.com/", desc: "Varredura contínua da internet: hosts, certificados e serviços expostos.", tags: ["cadastro", "web"] },
          { name: "FOFA", url: "https://en.fofa.info/", desc: "Mecanismo de busca de ativos expostos com sintaxe de consulta própria.", tags: ["cadastro", "web"] },
        ],
      },
      {
        name: "Reputação e informações",
        tools: [
          { name: "AbuseIPDB", url: "https://www.abuseipdb.com/", desc: "Base colaborativa de denúncias de IPs maliciosos (spam, força bruta, varreduras).", tags: ["gratuito", "web"] },
          { name: "GreyNoise", url: "https://www.greynoise.io/", desc: "Diz se um IP faz varredura em massa na internet ou se é um serviço benigno conhecido.", tags: ["gratuito", "cadastro", "web"] },
          { name: "IPinfo", url: "https://ipinfo.io/", desc: "Geolocalização, ASN, empresa e tipo de conexão de um IP.", tags: ["gratuito", "web"] },
          { name: "Hurricane Electric BGP Toolkit", url: "https://bgp.he.net/", desc: "Informações de ASN, prefixos, peers e rotas BGP.", tags: ["gratuito", "web"] },
          { name: "RIPEstat", url: "https://stat.ripe.net/", desc: "Painel do RIPE NCC com roteamento, geolocalização e histórico de IPs e ASNs.", tags: ["gratuito", "web"] },
        ],
      },
      {
        name: "Ferramentas locais",
        tools: [
          { name: "Nmap", url: "https://nmap.org/", desc: "Scanner de rede clássico para descoberta de hosts, portas e serviços. Use só em alvos autorizados.", tags: ["gratuito", "local"] },
        ],
      },
    ],
  },
  {
    id: "telefone",
    name: "Telefone",
    icon: "phone",
    summary: "Operadora, formato e presença de um número em serviços.",
    groups: [
      {
        name: "Consulta",
        tools: [
          { name: "Truecaller", url: "https://www.truecaller.com/", desc: "Identificação de chamadas baseada em agenda colaborativa; mostra o nome associado ao número.", tags: ["cadastro", "web"] },
          { name: "Sync.me", url: "https://sync.me/", desc: "Busca reversa de telefone com dados de redes sociais.", tags: ["gratuito", "web"] },
        ],
      },
      {
        name: "Ferramentas locais",
        tools: [
          { name: "PhoneInfoga", url: "https://github.com/sundowndev/phoneinfoga", desc: "Coleta informações de números internacionais: país, operadora, tipo de linha e pegadas na web.", tags: ["gratuito", "local"] },
        ],
      },
    ],
  },
  {
    id: "imagens",
    name: "Imagens e vídeo",
    icon: "image",
    summary: "Busca reversa, metadados EXIF e análise forense de imagens.",
    groups: [
      {
        name: "Busca reversa",
        tools: [
          { name: "Google Lens", url: "https://lens.google.com/", desc: "Busca reversa do Google: encontra a imagem, objetos e locais parecidos.", tags: ["gratuito", "web"] },
          { name: "Yandex Imagens", url: "https://yandex.com/images/", desc: "Busca reversa forte para rostos e paisagens, principalmente do Leste Europeu.", tags: ["gratuito", "web"] },
          { name: "TinEye", url: "https://tineye.com/", desc: "Encontra onde uma imagem já foi publicada e qual é a versão mais antiga.", tags: ["gratuito", "web"] },
          { name: "Bing Visual Search", url: "https://www.bing.com/visualsearch", desc: "Busca visual da Microsoft, útil como segunda opinião.", tags: ["gratuito", "web"] },
        ],
      },
      {
        name: "Metadados e forense",
        tools: [
          { name: "FotoForensics", url: "https://fotoforensics.com/", desc: "Análise de nível de erro (ELA) e metadados para detectar edições.", tags: ["gratuito", "web"] },
          { name: "Forensically", url: "https://29a.ch/photo-forensics/", desc: "Ferramentas forenses no navegador: clonagem, ELA, ruído e metadados.", tags: ["gratuito", "web"] },
          { name: "Jeffrey's Image Metadata Viewer", url: "https://exif.regex.info/exif.cgi", desc: "Mostra todos os metadados EXIF, IPTC e XMP de uma imagem por upload ou URL.", tags: ["gratuito", "web"] },
          { name: "ExifTool", url: "https://exiftool.org/", desc: "Ferramenta de referência para ler e editar metadados de praticamente qualquer arquivo.", tags: ["gratuito", "local"] },
        ],
      },
    ],
  },
  {
    id: "geolocalizacao",
    name: "Geolocalização e mapas",
    icon: "map",
    summary: "Mapas, satélite, street-level e posição do sol.",
    groups: [
      {
        name: "Mapas e satélite",
        tools: [
          { name: "Google Earth", url: "https://earth.google.com/web/", desc: "Imagens de satélite em 3D, com histórico de imagens no app desktop.", tags: ["gratuito", "web"] },
          { name: "Google Maps", url: "https://www.google.com/maps", desc: "Mapas, Street View e fotos enviadas por usuários.", tags: ["gratuito", "web"] },
          { name: "OpenStreetMap", url: "https://www.openstreetmap.org/", desc: "Mapa colaborativo e aberto, com dados detalhados de vias e edificações.", tags: ["gratuito", "web"] },
          { name: "Copernicus Browser", url: "https://browser.dataspace.copernicus.eu/", desc: "Imagens Sentinel recentes e históricas do programa europeu Copernicus.", tags: ["gratuito", "cadastro", "web"] },
          { name: "Wikimapia", url: "https://wikimapia.org/", desc: "Mapa colaborativo com anotações de lugares e construções.", tags: ["gratuito", "web"] },
        ],
      },
      {
        name: "Verificação de local e hora",
        tools: [
          { name: "Overpass Turbo", url: "https://overpass-turbo.eu/", desc: "Consulta dados do OpenStreetMap por atributos: ache todos os lugares que batem com uma descrição.", tags: ["gratuito", "web"] },
          { name: "SunCalc", url: "https://www.suncalc.org/", desc: "Posição e sombra do sol por local e horário, útil para datar fotos.", tags: ["gratuito", "web"] },
          { name: "Mapillary", url: "https://www.mapillary.com/", desc: "Fotos em nível de rua enviadas pela comunidade, inclusive onde não há Street View.", tags: ["gratuito", "web"] },
        ],
      },
    ],
  },
  {
    id: "arquivos",
    name: "Arquivos e cache",
    icon: "archive",
    summary: "Versões antigas de páginas e buscas avançadas.",
    groups: [
      {
        name: "Arquivos da web",
        tools: [
          { name: "Wayback Machine", url: "https://web.archive.org/", desc: "Histórico de capturas de páginas desde 1996, do Internet Archive.", tags: ["gratuito", "web"] },
          { name: "archive.today", url: "https://archive.ph/", desc: "Captura sob demanda de páginas, inclusive algumas que o Wayback não salva.", tags: ["gratuito", "web"] },
          { name: "Common Crawl", url: "https://commoncrawl.org/", desc: "Base aberta com petabytes de páginas rastreadas, consultável por índice de URLs.", tags: ["gratuito", "web"] },
        ],
      },
      {
        name: "Busca avançada",
        tools: [
          { name: "Google Hacking Database", url: "https://www.exploit-db.com/google-hacking-database", desc: "Coleção de dorks prontos da Exploit-DB para achar arquivos e painéis expostos.", tags: ["gratuito", "web"] },
        ],
      },
    ],
  },
  {
    id: "vazamentos",
    name: "Vazamentos",
    icon: "leak",
    summary: "Verificar se e-mails ou domínios aparecem em vazamentos.",
    groups: [
      {
        name: "Bases de vazamentos",
        tools: [
          { name: "Have I Been Pwned", url: "https://haveibeenpwned.com/", desc: "Verifica se um e-mail ou telefone aparece em vazamentos públicos conhecidos.", tags: ["gratuito", "web"] },
          { name: "Mozilla Monitor", url: "https://monitor.mozilla.org/", desc: "Alertas de vazamento da Mozilla, baseados nos dados do HIBP.", tags: ["gratuito", "cadastro", "web"] },
          { name: "Intelligence X", url: "https://intelx.io/", desc: "Busca em vazamentos, pastes, dark web e arquivos históricos por e-mail, domínio, IP e mais.", tags: ["cadastro", "pago", "web"] },
          { name: "DeHashed", url: "https://dehashed.com/", desc: "Busca em vazamentos por e-mail, nome, usuário, IP e telefone.", tags: ["pago", "web"] },
          { name: "LeakCheck", url: "https://leakcheck.io/", desc: "Busca em vazamentos por e-mail, usuário ou domínio.", tags: ["gratuito", "pago", "web"] },
        ],
      },
    ],
  },
  {
    id: "codigo",
    name: "Código e segredos",
    icon: "code",
    summary: "Buscar código público e segredos vazados em repositórios.",
    groups: [
      {
        name: "Busca de código",
        tools: [
          { name: "GitHub Code Search", url: "https://github.com/search?type=code", desc: "Busca em código público no GitHub com filtros por linguagem, caminho e organização.", tags: ["gratuito", "cadastro", "web"] },
          { name: "grep.app", url: "https://grep.app/", desc: "Busca por regex em meio milhão de repositórios públicos do GitHub.", tags: ["gratuito", "web"] },
          { name: "Sourcegraph", url: "https://sourcegraph.com/search", desc: "Busca de código em repositórios públicos com sintaxe avançada.", tags: ["gratuito", "web"] },
          { name: "PublicWWW", url: "https://publicwww.com/", desc: "Busca no código-fonte HTML/JS de milhões de sites (IDs de analytics, scripts, etc.).", tags: ["gratuito", "pago", "web"] },
        ],
      },
      {
        name: "Detecção de segredos",
        tools: [
          { name: "TruffleHog", url: "https://github.com/trufflesecurity/trufflehog", desc: "Encontra e valida credenciais vazadas em repositórios Git, buckets e mais.", tags: ["gratuito", "local"] },
          { name: "Gitleaks", url: "https://github.com/gitleaks/gitleaks", desc: "Varre o histórico Git atrás de chaves, tokens e senhas.", tags: ["gratuito", "local"] },
        ],
      },
    ],
  },
  {
    id: "empresas",
    name: "Empresas e registros públicos",
    icon: "building",
    summary: "CNPJ, processos, diários oficiais e dados abertos — com foco no Brasil.",
    groups: [
      {
        name: "Brasil",
        tools: [
          { name: "BrasilAPI", url: "https://brasilapi.com.br/", desc: "API aberta com CNPJ, CEP, bancos, feriados e mais. A consulta de CNPJ retorna sócios e atividades.", tags: ["gratuito", "web"] },
          { name: "Casa dos Dados", url: "https://casadosdados.com.br/", desc: "Busca de empresas por CNPJ, razão social, sócio e atividade.", tags: ["gratuito", "pago", "web"] },
          { name: "Jusbrasil", url: "https://www.jusbrasil.com.br/", desc: "Processos, diários oficiais e jurisprudência indexados por nome e documento.", tags: ["gratuito", "pago", "web"] },
          { name: "Querido Diário", url: "https://queridodiario.ok.org.br/", desc: "Busca em diários oficiais de municípios brasileiros, mantido pela Open Knowledge Brasil.", tags: ["gratuito", "web"] },
          { name: "Diário Oficial da União", url: "https://www.in.gov.br/", desc: "Publicações oficiais do governo federal: nomeações, contratos, portarias.", tags: ["gratuito", "web"] },
          { name: "Portal da Transparência", url: "https://portaldatransparencia.gov.br/", desc: "Gastos, servidores, contratos, sanções e benefícios do governo federal.", tags: ["gratuito", "web"] },
          { name: "Portal de Dados Abertos", url: "https://dados.gov.br/", desc: "Catálogo de bases de dados abertos do governo federal.", tags: ["gratuito", "web"] },
          { name: "DivulgaCandContas (TSE)", url: "https://divulgacandcontas.tse.jus.br/", desc: "Candidaturas, bens declarados e prestação de contas eleitorais.", tags: ["gratuito", "web"] },
        ],
      },
      {
        name: "Internacional",
        tools: [
          { name: "OpenCorporates", url: "https://opencorporates.com/", desc: "Maior base aberta de empresas do mundo, com registros de dezenas de jurisdições.", tags: ["gratuito", "web"] },
          { name: "OpenSanctions", url: "https://www.opensanctions.org/", desc: "Listas de sanções, pessoas politicamente expostas e entidades de interesse.", tags: ["gratuito", "web"] },
          { name: "SEC EDGAR", url: "https://www.sec.gov/edgar/search/", desc: "Documentos de empresas registradas na SEC dos Estados Unidos.", tags: ["gratuito", "web"] },
          { name: "Companies House (Reino Unido)", url: "https://find-and-update.company-information.service.gov.uk/", desc: "Registro oficial de empresas e diretores do Reino Unido.", tags: ["gratuito", "web"] },
        ],
      },
    ],
  },
  {
    id: "cripto",
    name: "Criptomoedas",
    icon: "bitcoin",
    summary: "Exploradores de blockchain e rastreamento de carteiras.",
    groups: [
      {
        name: "Exploradores",
        tools: [
          { name: "Blockchair", url: "https://blockchair.com/", desc: "Explorador multi-blockchain (Bitcoin, Ethereum e outras) com busca avançada.", tags: ["gratuito", "web"] },
          { name: "mempool.space", url: "https://mempool.space/", desc: "Explorador de Bitcoin de código aberto, com visualização de transações e taxas.", tags: ["gratuito", "web"] },
          { name: "Blockchain.com Explorer", url: "https://www.blockchain.com/explorer", desc: "Explorador de Bitcoin, Ethereum e Bitcoin Cash.", tags: ["gratuito", "web"] },
          { name: "Etherscan", url: "https://etherscan.io/", desc: "Explorador de referência para Ethereum: endereços, tokens e contratos.", tags: ["gratuito", "web"] },
          { name: "Tronscan", url: "https://tronscan.org/", desc: "Explorador da rede TRON, muito usada para transferências de USDT.", tags: ["gratuito", "web"] },
        ],
      },
      {
        name: "Análise e atribuição",
        tools: [
          { name: "WalletExplorer", url: "https://www.walletexplorer.com/", desc: "Agrupa endereços Bitcoin em carteiras e identifica exchanges e serviços.", tags: ["gratuito", "web"] },
          { name: "Arkham Intelligence", url: "https://intel.arkm.com/", desc: "Atribuição de carteiras a entidades e visualização de fluxos on-chain.", tags: ["cadastro", "web"] },
          { name: "Breadcrumbs", url: "https://www.breadcrumbs.app/", desc: "Investigação visual de transações com grafos de fluxo de fundos.", tags: ["cadastro", "web"] },
        ],
      },
    ],
  },
  {
    id: "transportes",
    name: "Transportes",
    icon: "plane",
    summary: "Rastreamento de aeronaves, navios e ferrovias.",
    groups: [
      {
        name: "Aéreo",
        tools: [
          { name: "Flightradar24", url: "https://www.flightradar24.com/", desc: "Voos em tempo real, histórico e dados de aeronaves.", tags: ["gratuito", "pago", "web"] },
          { name: "ADS-B Exchange", url: "https://globe.adsbexchange.com/", desc: "Rastreamento de voos sem filtragem, incluindo muitas aeronaves militares e privadas.", tags: ["gratuito", "web"] },
          { name: "FlightAware", url: "https://www.flightaware.com/", desc: "Rastreamento de voos e histórico por matrícula ou número de voo.", tags: ["gratuito", "web"] },
        ],
      },
      {
        name: "Marítimo e ferroviário",
        tools: [
          { name: "MarineTraffic", url: "https://www.marinetraffic.com/", desc: "Posição de navios via AIS, histórico de portos e dados de embarcações.", tags: ["gratuito", "pago", "web"] },
          { name: "VesselFinder", url: "https://www.vesselfinder.com/", desc: "Rastreamento de navios em tempo real por nome, IMO ou MMSI.", tags: ["gratuito", "web"] },
          { name: "OpenRailwayMap", url: "https://www.openrailwaymap.org/", desc: "Mapa da infraestrutura ferroviária mundial baseado no OpenStreetMap.", tags: ["gratuito", "web"] },
        ],
      },
    ],
  },
  {
    id: "dark-web",
    name: "Dark web",
    icon: "onion",
    summary: "Busca em serviços .onion e monitoramento de grupos de ransomware.",
    groups: [
      {
        name: "Busca e acesso",
        tools: [
          { name: "Ahmia", url: "https://ahmia.fi/", desc: "Buscador de serviços .onion que filtra conteúdo abusivo, acessível pela web comum.", tags: ["gratuito", "web"] },
          { name: "Tor Browser", url: "https://www.torproject.org/", desc: "Navegador oficial do Tor Project para acessar a rede .onion com anonimato.", tags: ["gratuito", "local"] },
          { name: "OnionScan", url: "https://github.com/s-rah/onionscan", desc: "Analisa serviços .onion em busca de falhas que revelem a identidade do operador.", tags: ["gratuito", "local"] },
        ],
      },
      {
        name: "Monitoramento",
        tools: [
          { name: "Ransomware.live", url: "https://www.ransomware.live/", desc: "Acompanha as vítimas publicadas nos sites de vazamento de grupos de ransomware.", tags: ["gratuito", "web"] },
        ],
      },
    ],
  },
  {
    id: "ameacas",
    name: "Inteligência de ameaças",
    icon: "shield",
    summary: "Reputação de arquivos, URLs e IOCs, CVEs e táticas de atacantes.",
    groups: [
      {
        name: "Análise de IOCs",
        tools: [
          { name: "VirusTotal", url: "https://www.virustotal.com/", desc: "Analisa arquivos, hashes, URLs, domínios e IPs com dezenas de antivírus e relações.", tags: ["gratuito", "web"] },
          { name: "AlienVault OTX", url: "https://otx.alienvault.com/", desc: "Plataforma aberta de compartilhamento de ameaças com pulsos de IOCs.", tags: ["gratuito", "cadastro", "web"] },
          { name: "Pulsedive", url: "https://pulsedive.com/", desc: "Enriquecimento de IOCs com reputação, histórico e ligações.", tags: ["gratuito", "web"] },
          { name: "URLhaus", url: "https://urlhaus.abuse.ch/", desc: "Base da abuse.ch com URLs usadas para distribuir malware.", tags: ["gratuito", "web"] },
          { name: "MalwareBazaar", url: "https://bazaar.abuse.ch/", desc: "Amostras de malware compartilhadas, pesquisáveis por hash, assinatura e tag.", tags: ["gratuito", "web"] },
          { name: "ThreatFox", url: "https://threatfox.abuse.ch/", desc: "IOCs associados a famílias de malware, compartilhados pela comunidade.", tags: ["gratuito", "web"] },
        ],
      },
      {
        name: "Sandbox",
        tools: [
          { name: "Hybrid Analysis", url: "https://www.hybrid-analysis.com/", desc: "Sandbox gratuita da CrowdStrike para análise dinâmica de arquivos e URLs.", tags: ["gratuito", "cadastro", "web"] },
          { name: "ANY.RUN", url: "https://any.run/", desc: "Sandbox interativa: você controla a máquina virtual enquanto o malware roda.", tags: ["cadastro", "pago", "web"] },
        ],
      },
      {
        name: "Vulnerabilidades e táticas",
        tools: [
          { name: "MITRE ATT&CK", url: "https://attack.mitre.org/", desc: "Base de táticas, técnicas e grupos de atacantes usada como linguagem comum em segurança.", tags: ["gratuito", "web"] },
          { name: "NVD", url: "https://nvd.nist.gov/", desc: "Base nacional de vulnerabilidades dos EUA, com pontuação CVSS.", tags: ["gratuito", "web"] },
          { name: "CVE.org", url: "https://www.cve.org/", desc: "Programa oficial de identificadores CVE.", tags: ["gratuito", "web"] },
          { name: "CISA KEV", url: "https://www.cisa.gov/known-exploited-vulnerabilities-catalog", desc: "Catálogo de vulnerabilidades sabidamente exploradas, ótimo para priorizar correções.", tags: ["gratuito", "web"] },
        ],
      },
    ],
  },
  {
    id: "frameworks",
    name: "Frameworks e utilitários",
    icon: "terminal",
    summary: "Plataformas de automação de OSINT e canivetes suíços.",
    groups: [
      {
        name: "Automação de reconhecimento",
        tools: [
          { name: "SpiderFoot", url: "https://github.com/smicallef/spiderfoot", desc: "Automação de OSINT com mais de 200 módulos e interface web local.", tags: ["gratuito", "local"] },
          { name: "theHarvester", url: "https://github.com/laramies/theHarvester", desc: "Coleta e-mails, subdomínios, IPs e nomes a partir de fontes públicas.", tags: ["gratuito", "local"] },
          { name: "Recon-ng", url: "https://github.com/lanmaster53/recon-ng", desc: "Framework modular de reconhecimento web com interface parecida com o Metasploit.", tags: ["gratuito", "local"] },
          { name: "Maltego", url: "https://www.maltego.com/", desc: "Análise de vínculos em grafo com transformações para dezenas de fontes.", tags: ["cadastro", "pago", "local"] },
        ],
      },
      {
        name: "Utilitários",
        tools: [
          { name: "CyberChef", url: "https://gchq.github.io/CyberChef/", desc: "O \"canivete suíço\" do GCHQ: centenas de operações de codificação, criptografia e análise de dados.", tags: ["gratuito", "web"] },
          { name: "Kali Linux", url: "https://www.kali.org/", desc: "Distribuição Linux com centenas de ferramentas de segurança pré-instaladas.", tags: ["gratuito", "local"] },
        ],
      },
    ],
  },
];

export function toolId(tool: Tool): string {
  return tool.url.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

export const TOOL_COUNT = CATEGORIES.reduce(
  (sum, c) => sum + c.groups.reduce((s, g) => s + g.tools.length, 0),
  0,
);

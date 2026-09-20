/**
 * Bibliographic registry for everything shown on the site.
 *
 * Every number rendered anywhere is either `observed` — traceable to one of these
 * published sources — or `illustrative` — generated to demonstrate the interface.
 * The UI must never present the two as the same kind of claim.
 */

export type SourceId =
  | 'resonance-world-2026'
  | 'resonance-europe-2026'
  | 'resonance-asiapacific-2025'
  | 'resonance-americas-2026'
  | 'jrc-c3-2023'
  | 'jrc-c3-2017'
  | 'oecd-jrc-2008'
  | 'beckert-rossel-2013'
  | 'braden-teekens-2019'
  | 'becker-1982'
  | 'unctad-2024'
  | 'unesco-2019'
  | 'oecd-culture-local'

export type SourceKind = 'index' | 'framework' | 'research' | 'policy'

export type Source = {
  id: SourceId
  title: string
  author: string
  publisher: string
  year: number
  kind: SourceKind
  /** What this site actually uses it for. */
  use: string
  /** Filename under src/report. */
  file: string
}

export const sources: readonly Source[] = [
  {
    id: 'resonance-world-2026',
    title: "World's Best Cities 2026",
    author: 'Resonance Consultancy',
    publisher: 'Resonance Consultancy',
    year: 2026,
    kind: 'index',
    use: '전 세계 도시 순위와 Livability·Lovability·Prosperity 세 축의 관측값',
    file: 'Best-Cities-Worlds-Best-Cities-2026.pdf',
  },
  {
    id: 'resonance-europe-2026',
    title: "Europe's Best Cities 2026",
    author: 'Resonance Consultancy',
    publisher: 'Resonance Consultancy',
    year: 2026,
    kind: 'index',
    use: '유럽 권역 내 상대 순위 (바젤·베네치아 등 글로벌 100위권 밖 도시 포함)',
    file: 'Best-Cities-Europes-Best-Cities-2026.pdf',
  },
  {
    id: 'resonance-asiapacific-2025',
    title: "Asia-Pacific's Best Cities 2025",
    author: 'Resonance Consultancy',
    publisher: 'Resonance Consultancy',
    year: 2025,
    kind: 'index',
    use: '아시아·태평양 권역 내 상대 순위',
    file: 'Best-Cities-Asia-Pacifics-Best-Cities-2025.pdf',
  },
  {
    id: 'resonance-americas-2026',
    title: "America's Best Cities 2026",
    author: 'Resonance Consultancy',
    publisher: 'Resonance Consultancy',
    year: 2026,
    kind: 'index',
    use: '미주 권역 내 상대 순위',
    file: 'Best-Cities-Americas-Best-Cities-2026.pdf',
  },
  {
    id: 'jrc-c3-2023',
    title: 'The Cultural and Creative Cities Monitor — 2023 edition',
    author: 'Montalto, V. et al.',
    publisher: 'European Commission, Joint Research Centre',
    year: 2023,
    kind: 'framework',
    use: '6개 차원 구조의 근거. Cultural Vibrancy 40% · Creative Economy 40% · Enabling Environment 20%의 가중 구조와 불확실성 진단을 차용',
    file: 'Cultural and Creative Cities Monitor 2023.pdf',
  },
  {
    id: 'jrc-c3-2017',
    title: 'The Cultural and Creative Cities Monitor — 2017 edition',
    author: 'Montalto, V. et al.',
    publisher: 'European Commission, Joint Research Centre',
    year: 2017,
    kind: 'framework',
    use: '지표 체계의 초판 설계와 전문가 가중치 설정 배경',
    file: 'The-Cultural-and-Creative-Cities-Monitor_2017.pdf',
  },
  {
    id: 'oecd-jrc-2008',
    title: 'Handbook on Constructing Composite Indicators — Methodology and User Guide',
    author: 'OECD & JRC',
    publisher: 'OECD Publishing',
    year: 2008,
    kind: 'framework',
    use: '합성지표 구성 절차(정규화·가중·민감도 분석)의 표준 근거',
    file: 'Joint Research Centre.pdf',
  },
  {
    id: 'beckert-rossel-2013',
    title: 'The Price of Art: Uncertainty and Reputation in the Art Field',
    author: 'Beckert, J. & Rössel, J.',
    publisher: 'European Societies 15(2), 178–195',
    year: 2013,
    kind: 'research',
    use: '가격이 작품의 내재 가치가 아니라 갤러리·큐레이터·비평가가 부여한 평판에서 형성된다는 MARKET 차원의 근거',
    file: 'THE PRICE OF ART.pdf',
  },
  {
    id: 'braden-teekens-2019',
    title: 'Reputation, Status Networks, and the Art Market',
    author: 'Braden, L.E.A. & Teekens, T.',
    publisher: 'Arts 8(3), 81',
    year: 2019,
    kind: 'research',
    use: '연결망 내 위치가 작가의 지위를 끌어올린다는 INFLUENCE 차원의 근거',
    file: 'Reputation_Status_Networks_and_the_Art_Market.pdf',
  },
  {
    id: 'becker-1982',
    title: 'Art Worlds',
    author: 'Becker, H. S.',
    publisher: 'University of California Press',
    year: 1982,
    kind: 'research',
    use: '예술이 개인이 아니라 협업 네트워크의 산물이라는 PRODUCTION 차원의 이론적 배경',
    file: 'howard-s-becker-art-worlds.pdf',
  },
  {
    id: 'unctad-2024',
    title: 'Creative Economy Outlook 2024',
    author: 'UNCTAD',
    publisher: 'United Nations',
    year: 2024,
    kind: 'policy',
    use: '창조경제 교역 규모와 정책 동향',
    file: 'Creative Economy Outlook 2024.pdf',
  },
  {
    id: 'unesco-2019',
    title: 'Culture for Development Indicators',
    author: 'UNESCO',
    publisher: 'UNESCO',
    year: 2019,
    kind: 'policy',
    use: '문화 참여와 개발 지표의 국제 비교 기준',
    file: 'UNESCO_culture develoment_2019.pdf',
  },
  {
    id: 'oecd-culture-local',
    title: 'Culture and Local Development: Maximising the Impact',
    author: 'OECD',
    publisher: 'OECD Publishing',
    year: 2018,
    kind: 'policy',
    use: 'PARTICIPATION 차원의 지역 문화 참여 측정 논의',
    file: 'Culture and local development maximising the impact.pdf',
  },
]

export function findSource(id: SourceId): Source | undefined {
  return sources.find((source) => source.id === id)
}

export function citation(id: SourceId): string {
  const source = findSource(id)
  if (!source) return ''
  return `${source.author} (${source.year}), ${source.title}, ${source.publisher}`
}

export const sourceCount = sources.length

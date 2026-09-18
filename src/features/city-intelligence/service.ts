import type { City } from '@/types/city'

export const cities: readonly City[] = [
  {
    slug: 'seoul', code: 'SEO', name: 'Seoul', country: 'South Korea', latitude: 37.5665, longitude: 126.978,
    index: 78.4, type: 'Networked Experimenter', dna: 'Fast systems · Fluid formats',
    signalScores: { market: 78, cultural: 87, opportunity: 82 },
    market: { artists: ['Lee Bul', 'Haegue Yang'], priceRange: '10K–1.5M', currency: 'USD', status: 'indicative' },
    cultural: { institutions: ['MMCA', 'Leeum', 'Seoul Museum of Art'], events: ['Seoul Mediacity Biennale', 'Frieze Seoul'], keywords: ['digital material', 'institutional scale', 'Asian bridge'] },
    industry: ['Furniture', 'Hotel', 'Fashion'], opportunity: 'Interactive object showroom · artist-edition product',
  },
  {
    slug: 'berlin', code: 'BER', name: 'Berlin', country: 'Germany', latitude: 52.52, longitude: 13.405,
    index: 80.2, type: 'Independent Production Lab', dna: 'Dense production · Open networks',
    signalScores: { market: 62, cultural: 91, opportunity: 79 },
    market: { artists: ['Olafur Eliasson', 'Katharina Grosse'], priceRange: '8K–2.0M', currency: 'USD', status: 'indicative' },
    cultural: { institutions: ['Hamburger Bahnhof', 'KW', 'Gropius Bau'], events: ['Berlin Art Week', 'Gallery Weekend'], keywords: ['independent space', 'critical practice', 'reuse'] },
    industry: ['Fashion', 'Furniture', 'Urban space'], opportunity: 'Circular-material residency · community showroom',
  },
  {
    slug: 'milan', code: 'MIL', name: 'Milan', country: 'Italy', latitude: 45.4642, longitude: 9.19,
    index: 82.7, type: 'Market–Design Connector', dna: 'Design capital · Commercial translation',
    signalScores: { market: 86, cultural: 76, opportunity: 84 },
    market: { artists: ['Maurizio Cattelan', 'Paola Pivi'], priceRange: '15K–3.0M', currency: 'USD', status: 'indicative' },
    cultural: { institutions: ['Fondazione Prada', 'Pirelli HangarBicocca'], events: ['Miart', 'Milan Design Week'], keywords: ['design industry', 'collectible object', 'patronage'] },
    industry: ['Furniture', 'Fashion', 'Hospitality'], opportunity: 'Collectible design salon · art-led hotel suite',
  },
  {
    slug: 'london', code: 'LON', name: 'London', country: 'United Kingdom', latitude: 51.5072, longitude: -0.1276,
    index: 88.6, type: 'Global Market Institution', dna: 'Market depth · Institutional reach',
    signalScores: { market: 93, cultural: 88, opportunity: 80 },
    market: { artists: ['Lubaina Himid', 'Damien Hirst'], priceRange: '20K–5.0M+', currency: 'USD', status: 'indicative' },
    cultural: { institutions: ['Tate Modern', 'Serpentine', 'ICA'], events: ['Frieze London', 'London Gallery Weekend'], keywords: ['global market', 'public institution', 'diaspora'] },
    industry: ['Finance', 'Hospitality', 'Fashion'], opportunity: 'Cultural concierge · collection-led brand programme',
  },
  {
    slug: 'new-york', code: 'NYC', name: 'New York', country: 'United States', latitude: 40.7128, longitude: -74.006,
    index: 91.4, type: 'Global Market Engine', dna: 'Capital concentration · Network power',
    signalScores: { market: 97, cultural: 91, opportunity: 86 },
    market: { artists: ['Julie Mehretu', 'Jean-Michel Basquiat'], priceRange: '25K–10M+', currency: 'USD', status: 'indicative' },
    cultural: { institutions: ['MoMA', 'Whitney', 'New Museum'], events: ['The Armory Show', 'Frieze New York'], keywords: ['market liquidity', 'gallery network', 'global influence'] },
    industry: ['Finance', 'Retail', 'Media'], opportunity: 'Collection intelligence service · cultural flagship',
  },
  {
    slug: 'mexico-city', code: 'MEX', name: 'Mexico City', country: 'Mexico', latitude: 19.4326, longitude: -99.1332,
    index: 72.1, type: 'Local–Global Generator', dna: 'Material culture · Independent energy',
    signalScores: { market: 68, cultural: 84, opportunity: 77 },
    market: { artists: ['Gabriel Orozco', 'Minerva Cuevas'], priceRange: '5K–900K', currency: 'USD', status: 'indicative' },
    cultural: { institutions: ['Museo Jumex', 'MUAC', 'Kurimanzutto'], events: ['Zona Maco', 'Material Art Fair'], keywords: ['local material', 'artist-run', 'public life'] },
    industry: ['Food', 'Tourism', 'Furniture'], opportunity: 'Maker-led hospitality · material research collection',
  },
  {
    slug: 'melbourne', code: 'MEL', name: 'Melbourne', country: 'Australia', latitude: -37.8136, longitude: 144.9631,
    index: 74.8, type: 'Participation Hub', dna: 'Civic access · Distributed culture',
    signalScores: { market: 66, cultural: 86, opportunity: 74 },
    market: { artists: ['Patricia Piccinini', 'Brook Andrew'], priceRange: '6K–700K', currency: 'USD', status: 'indicative' },
    cultural: { institutions: ['NGV', 'ACCA', 'ACMI'], events: ['Melbourne Art Fair', 'RISING'], keywords: ['public participation', 'moving image', 'First Nations'] },
    industry: ['Tourism', 'Education', 'Hospitality'], opportunity: 'Neighbourhood art route · participatory hotel programme',
  },
  {
    slug: 'lisbon', code: 'LIS', name: 'Lisbon', country: 'Portugal', latitude: 38.7223, longitude: -9.1393,
    index: 70.6, type: 'Emerging Atlantic Network', dna: 'New institutions · Translocal exchange',
    signalScores: { market: 64, cultural: 78, opportunity: 73 },
    market: { artists: ['Joana Vasconcelos', 'Julião Sarmento'], priceRange: '4K–600K', currency: 'USD', status: 'indicative' },
    cultural: { institutions: ['MAAT', 'CAM Gulbenkian', 'MAC/CCB'], events: ['ARCOlisboa', 'Lisbon Art Weekend'], keywords: ['Atlantic exchange', 'adaptive reuse', 'emerging scene'] },
    industry: ['Tourism', 'Hotel', 'Urban branding'], opportunity: 'Adaptive-reuse art stay · Atlantic maker programme',
  },
]

export function listCities(): readonly City[] {
  return cities
}

export function findCity(slug: string): City | undefined {
  return cities.find((city) => city.slug === slug)
}

export function rankCities(): readonly City[] {
  return [...cities].sort((a, b) => b.index - a.index)
}

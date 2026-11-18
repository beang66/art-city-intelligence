import type { StaticImageData } from 'next/image'
import type { City } from '@/types/city'
import snapshot from '@/data/snapshot_v1.json'
import imgSeoul from '@/img/Nam-June-Paik-TV-Buddha.jpeg'
import imgBerlin from '@/img/Abstraktes Bild-Gerhard Richter.jpg'
import imgLondon from '@/img/BACON_1969_Three_Studies_of_Lucian_Freud_triptych-620x420.jpg'
import imgNewYork from '@/img/Warhol_Marilyn.jpg'
import imgMexicoCity from '@/img/diego-and-i.jpg'
import imgMelbourne from '@/img/First-Class Marksman.jpg'
import imgAmsterdam from '@/img/Untitled XXV.jpg'
import imgBeijing from '@/img/Twelve_Landscape_Screens_by_Qi_Baishi.jpg'
import imgBarcelona from '@/img/Blue-Star-1-796x1024.jpg'
import imgChicago from '@/img/jimson-weed-white-flower.jpg'
import imgDubai from '@/img/farhad-moshiri-14439_0@2x.jpg'
import imgHongKong from '@/img/Juin-Octobre 1985.jpg'
import imgParis from '@/img/FC1 (Fire-Color 1).jpg'
import imgVenice from '@/img/Concetto Spaziale, La Fine di Dio.jpg'
import imgBasel from '@/img/Méta-Malevich.jpg'
import imgTokyo from '@/img/Yayoi Kusama Untitled.jpg'
import imgShanghai from '@/img/Zeng Fanzhi The Last Supper.jpg'
import imgSingapore from '@/img/Still Life with Big Durian.jpg'

/** Signature-work images by file name; the data in backend/data refers to them as `imageFile`. */
const images: Record<string, StaticImageData> = {
  'Nam-June-Paik-TV-Buddha.jpeg': imgSeoul,
  'Abstraktes Bild-Gerhard Richter.jpg': imgBerlin,
  'BACON_1969_Three_Studies_of_Lucian_Freud_triptych-620x420.jpg': imgLondon,
  'Warhol_Marilyn.jpg': imgNewYork,
  'diego-and-i.jpg': imgMexicoCity,
  'First-Class Marksman.jpg': imgMelbourne,
  'Untitled XXV.jpg': imgAmsterdam,
  'Twelve_Landscape_Screens_by_Qi_Baishi.jpg': imgBeijing,
  'Blue-Star-1-796x1024.jpg': imgBarcelona,
  'jimson-weed-white-flower.jpg': imgChicago,
  'farhad-moshiri-14439_0@2x.jpg': imgDubai,
  'Juin-Octobre 1985.jpg': imgHongKong,
  'FC1 (Fire-Color 1).jpg': imgParis,
  'Concetto Spaziale, La Fine di Dio.jpg': imgVenice,
  'Méta-Malevich.jpg': imgBasel,
  'Yayoi Kusama Untitled.jpg': imgTokyo,
  'Zeng Fanzhi The Last Supper.jpg': imgShanghai,
  'Still Life with Big Durian.jpg': imgSingapore,
}

/** Sample years for every city's `trend` array — one year per value. */
export const TREND_YEARS: readonly number[] = snapshot.trendYears

type CityRecord = Omit<City, 'signatureWork'> & { signatureWork: Omit<City['signatureWork'], 'image'> & { imageFile: string } }

/**
 * 인터페이스 시연용 도시 데이터 (원본: backend/data/cities_v1.json). index·signalScores·trend·가격 범위·추천 문구는
 * 측정된 비교 지표나 검증된 시장 가격이 아니다. 관측 순위는 backend/data/observations_v1.json에 따로 있다.
 */
export const cities: readonly City[] = (snapshot.cities as unknown as CityRecord[]).map(({ signatureWork: { imageFile, ...work }, ...city }) => ({
  ...city,
  signatureWork: { ...work, image: images[imageFile] },
}))

export function listCities(): readonly City[] {
  return cities
}

export function findCity(slug: string): City | undefined {
  return cities.find((city) => city.slug === slug)
}

/** Cities A–Z by English name. */
export const citiesByName: readonly City[] = [...cities].sort((a, b) => a.name.localeCompare(b.name))

/** Highest illustrative index first — order computed in backend/app/services/scoring.py. */
export function rankCities(): readonly City[] {
  return snapshot.ranking.map((slug) => findCity(slug)).filter((city): city is City => Boolean(city))
}

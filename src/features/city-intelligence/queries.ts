import { findCity, listCities, rankCities } from './service'

export async function getCities() {
  return listCities()
}

export async function getCity(slug: string) {
  return findCity(slug)
}

export async function getRankedCities() {
  return rankCities()
}

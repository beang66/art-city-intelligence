/**
 * Fetches the Natural Earth 110m land TopoJSON, converts it to simplified
 * polygon ring arrays, and writes a compact JSON to public/textures/land-polygons.json.
 *
 * Format: Array of polygons, each polygon is an array of rings,
 *         each ring is an array of [longitude, latitude] pairs.
 */
import { createRequire } from 'module'
import { writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'

const require = createRequire(import.meta.url)
const topojson = require('topojson-client')

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outPath = path.join(__dirname, '../public/textures/land-polygons.json')

const url = 'https://cdn.jsdelivr.net/npm/world-atlas@2/land-110m.json'

console.log('Fetching', url)
const res = await fetch(url)
const topology = await res.json()

const geojson = topojson.feature(topology, topology.objects.land)

// Extract polygon rings; simplify coordinates to 2 decimals to reduce size
const polygons = []
for (const feature of geojson.features) {
  const { type, coordinates } = feature.geometry
  if (type === 'Polygon') {
    polygons.push(coordinates.map(ring => ring.map(([lng, lat]) => [Math.round(lng * 10) / 10, Math.round(lat * 10) / 10])))
  } else if (type === 'MultiPolygon') {
    for (const polygon of coordinates) {
      polygons.push(polygon.map(ring => ring.map(([lng, lat]) => [Math.round(lng * 10) / 10, Math.round(lat * 10) / 10])))
    }
  }
}

writeFileSync(outPath, JSON.stringify(polygons))
console.log(`Written ${polygons.length} polygons to`, outPath)

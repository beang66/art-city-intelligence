'use client'

import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import type { RefObject } from 'react'
import type { City } from '@/types/city'

export type GlobeController = { focusCity: (city: City) => void }

type GlobeInteractionProps = {
  canvasRef: RefObject<HTMLCanvasElement | null>
  stageRef: RefObject<HTMLDivElement | null>
  cities: readonly City[]
}

type ProjectedPoint = { x: number; y: number; z: number; visible: boolean }

type LandPolygons = [number, number][][][]

const Z_THRESHOLD = -0.05

const CONNECTION_PAIRS: [string, string][] = [
  ['new-york', 'london'],
  ['new-york', 'paris'],
  ['new-york', 'mexico-city'],
  ['london', 'paris'],
  ['london', 'berlin'],
  ['london', 'milan'],
  ['london', 'dubai'],
  ['london', 'hong-kong'],
  ['paris', 'milan'],
  ['paris', 'venice'],
  ['paris', 'basel'],
  ['berlin', 'amsterdam'],
  ['milan', 'venice'],
  ['milan', 'basel'],
  ['amsterdam', 'lisbon'],
  ['dubai', 'singapore'],
  ['dubai', 'tokyo'],
  ['hong-kong', 'shanghai'],
  ['hong-kong', 'tokyo'],
  ['hong-kong', 'singapore'],
  ['shanghai', 'beijing'],
  ['tokyo', 'seoul'],
  ['seoul', 'beijing'],
  ['singapore', 'melbourne'],
  ['barcelona', 'paris'],
  ['barcelona', 'milan'],
  ['chicago', 'new-york'],
]

type Particle = {
  pairIndex: number
  t: number
  speed: number
}

export const GlobeInteraction = forwardRef<GlobeController, GlobeInteractionProps>(function GlobeInteraction(
  { canvasRef, stageRef, cities },
  ref,
) {
  const target = useRef({ longitude: 28, latitude: 17 })
  const activeCity = useRef<string | null>(null)
  const lastInteraction = useRef(0)

  useImperativeHandle(ref, () => ({
    focusCity(city) {
      activeCity.current = city.slug
      target.current = {
        longitude: city.longitude,
        latitude: Math.max(-38, Math.min(38, city.latitude * 0.45)),
      }
      lastInteraction.current = performance.now()
    },
  }), [])

  useEffect(() => {
    const canvas = canvasRef.current
    const stage = stageRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !stage || !context) return

    let landPolygons: LandPolygons = []
    let width = 0
    let height = 0
    let radius = 0
    let centerX = 0
    let centerY = 0
    let currentLongitude = 28
    let currentLatitude = 17
    let dragging = false
    let dragStartX = 0
    let dragStartY = 0
    let dragLongitude = 0
    let dragLatitude = 0
    let animationFrame = 0
    let cancelled = false
    let lastTime = 0
    let baseRadius = 0
    let targetZoom = 1.0
    let currentZoom = 1.0
    const ZOOM_MIN = 0.6
    const ZOOM_MAX = 2.5
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    lastInteraction.current = performance.now()

    const ORANGE = 'rgba(255,84,56,'

    const cityMap = new Map<string, City>()
    for (const c of cities) cityMap.set(c.slug, c)

    const validPairs = CONNECTION_PAIRS.filter(
      ([a, b]) => cityMap.has(a) && cityMap.has(b),
    )

    // One particle per arc, slow speed
    const particles: Particle[] = []
    if (!reducedMotion) {
      for (let pi = 0; pi < validPairs.length; pi++) {
        particles.push({
          pairIndex: pi,
          t: Math.random(), // random start position
          speed: 0.00006 + Math.random() * 0.00003, // very slow: ~0.06–0.09 per second
        })
      }
    }

    const resize = () => {
      const rect = stage.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = rect.width
      height = rect.height
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      context.setTransform(dpr, 0, 0, dpr, 0, 0)
      baseRadius = Math.min(width * 0.38, height * 0.43)
      radius = baseRadius * currentZoom
      centerX = width * 0.52
      centerY = height * 0.48
    }

    /**
     * Project a lat/lng point onto the canvas at a given altitude multiplier.
     * altitude = 1.0 is the globe surface; altitude > 1.0 is above the surface.
     */
    const projectAtAltitude = (latitude: number, longitude: number, altitude: number): ProjectedPoint => {
      const radians = Math.PI / 180
      const phi = latitude * radians
      const originPhi = currentLatitude * radians
      const lambda = (longitude - currentLongitude) * radians
      const cosPhi = Math.cos(phi)
      const x = cosPhi * Math.sin(lambda)
      const y = Math.cos(originPhi) * Math.sin(phi) - Math.sin(originPhi) * cosPhi * Math.cos(lambda)
      const z = Math.sin(originPhi) * Math.sin(phi) + Math.cos(originPhi) * cosPhi * Math.cos(lambda)
      const r = radius * altitude
      return {
        x: centerX + x * r,
        y: centerY - y * r,
        z,
        visible: z > Z_THRESHOLD,
      }
    }

    const project = (latitude: number, longitude: number): ProjectedPoint => {
      return projectAtAltitude(latitude, longitude, 1.0)
    }

    const drawGraticule = () => {
      context.lineWidth = 0.5
      context.strokeStyle = 'rgba(120,130,140,.1)'
      const drawCurve = (samples: { latitude: number; longitude: number }[]) => {
        context.beginPath()
        let drawing = false
        for (const sample of samples) {
          const point = project(sample.latitude, sample.longitude)
          if (!point.visible) { drawing = false; continue }
          if (!drawing) { context.moveTo(point.x, point.y); drawing = true } else context.lineTo(point.x, point.y)
        }
        context.stroke()
      }
      for (let latitude = -60; latitude <= 60; latitude += 30) {
        const samples = []
        for (let longitude = -180; longitude <= 180; longitude += 4) samples.push({ latitude, longitude })
        drawCurve(samples)
      }
      for (let longitude = -150; longitude <= 180; longitude += 30) {
        const samples = []
        for (let latitude = -88; latitude <= 88; latitude += 3) samples.push({ latitude, longitude })
        drawCurve(samples)
      }
    }

    const buildRingPath = (ring: [number, number][]): boolean => {
      let hasVisible = false
      let inPath = false
      let prevLng = ring[0]?.[0] ?? 0

      for (let i = 0; i < ring.length; i++) {
        const [lng, lat] = ring[i]
        const pt = project(lat, lng)

        const crossesAntimeridian = i > 0 && Math.abs(lng - prevLng) > 180
        prevLng = lng

        if (crossesAntimeridian || !pt.visible) {
          inPath = false
          continue
        }

        if (!inPath) {
          context.moveTo(pt.x, pt.y)
          inPath = true
        } else {
          context.lineTo(pt.x, pt.y)
        }
        hasVisible = true
      }

      return hasVisible
    }

    const drawLandPolygons = () => {
      for (const polygon of landPolygons) {
        const outerRing = polygon[0]
        if (!outerRing || outerRing.length === 0) continue

        const step = Math.max(1, Math.floor(outerRing.length / 20))
        let anySampleVisible = false
        for (let si = 0; si < outerRing.length; si += step) {
          const [sLng, sLat] = outerRing[si]
          if (project(sLat, sLng).z > -0.6) { anySampleVisible = true; break }
        }
        if (!anySampleVisible) continue

        context.beginPath()
        let hasVisible = false
        for (const ring of polygon) {
          if (buildRingPath(ring)) hasVisible = true
        }
        if (!hasVisible) continue

        context.fillStyle = '#ffffff'
        context.fill()

        context.beginPath()
        for (const ring of polygon) { buildRingPath(ring) }
        context.strokeStyle = 'rgba(30,35,42,0.45)'
        context.lineWidth = 0.55
        context.stroke()
      }
    }

    /**
     * Spherical linear interpolation between two lat/lng points.
     */
    const slerp = (
      lat1: number, lng1: number,
      lat2: number, lng2: number,
      t: number,
    ): [number, number] => {
      const R = Math.PI / 180
      const phi1 = lat1 * R, lam1 = lng1 * R
      const phi2 = lat2 * R, lam2 = lng2 * R
      const x1 = Math.cos(phi1) * Math.cos(lam1)
      const y1 = Math.cos(phi1) * Math.sin(lam1)
      const z1 = Math.sin(phi1)
      const x2 = Math.cos(phi2) * Math.cos(lam2)
      const y2 = Math.cos(phi2) * Math.sin(lam2)
      const z2 = Math.sin(phi2)
      const dot = Math.max(-1, Math.min(1, x1 * x2 + y1 * y2 + z1 * z2))
      const omega = Math.acos(dot)
      if (omega < 1e-6) return [lat1, lng1]
      const sinO = Math.sin(omega)
      const s1 = Math.sin((1 - t) * omega) / sinO
      const s2 = Math.sin(t * omega) / sinO
      const rx = s1 * x1 + s2 * x2
      const ry = s1 * y1 + s2 * y2
      const rz = s1 * z1 + s2 * z2
      const latOut = Math.atan2(rz, Math.sqrt(rx * rx + ry * ry)) / R
      const lngOut = Math.atan2(ry, rx) / R
      return [latOut, lngOut]
    }

    /**
     * Compute altitude for a point along the arc.
     * Uses a parabolic curve peaking at the midpoint (t = 0.5).
     * peakAltitude is the multiplier above surface at the apex (e.g., 1.15 = 15% above).
     * The peak altitude scales with the angular distance between the two cities.
     */
    const arcAltitude = (t: number, cityA: City, cityB: City): number => {
      const R = Math.PI / 180
      const phi1 = cityA.latitude * R, lam1 = cityA.longitude * R
      const phi2 = cityB.latitude * R, lam2 = cityB.longitude * R
      const x1 = Math.cos(phi1) * Math.cos(lam1), y1 = Math.cos(phi1) * Math.sin(lam1), z1 = Math.sin(phi1)
      const x2 = Math.cos(phi2) * Math.cos(lam2), y2 = Math.cos(phi2) * Math.sin(lam2), z2 = Math.sin(phi2)
      const dot = Math.max(-1, Math.min(1, x1 * x2 + y1 * y2 + z1 * z2))
      const angularDist = Math.acos(dot) // in radians, 0..PI

      // Peak altitude proportional to distance: short arcs barely lift, long arcs go high
      // Range: ~1.04 for very short arcs to ~1.22 for half-globe arcs
      const peakExtra = 0.04 + angularDist * 0.12
      // Parabolic: 4 * t * (1 - t) peaks at 1.0 when t = 0.5
      const lift = 4 * t * (1 - t)
      return 1.0 + peakExtra * lift
    }

    /**
     * Draw great-circle arc between two cities, lifted above the globe surface.
     */
    const SEGMENTS = 60
    const drawArc = (cityA: City, cityB: City, alpha: number) => {
      context.beginPath()
      let inPath = false

      for (let i = 0; i <= SEGMENTS; i++) {
        const t = i / SEGMENTS
        const [lat, lng] = slerp(cityA.latitude, cityA.longitude, cityB.latitude, cityB.longitude, t)
        const alt = arcAltitude(t, cityA, cityB)
        const pt = projectAtAltitude(lat, lng, alt)

        if (!pt.visible) {
          inPath = false
          continue
        }
        if (!inPath) { context.moveTo(pt.x, pt.y); inPath = true }
        else context.lineTo(pt.x, pt.y)
      }

      context.strokeStyle = `${ORANGE}${alpha})`
      context.lineWidth = 0.9
      context.stroke()
    }

    const drawCityArcs = (projectedCities: Map<string, { city: City; point: ProjectedPoint }>) => {
      for (const [slugA, slugB] of validPairs) {
        const a = projectedCities.get(slugA)
        const b = projectedCities.get(slugB)
        if (!a || !b) continue
        const minZ = Math.min(a.point.z, b.point.z)
        if (minZ < -0.5) continue
        const alpha = Math.max(0, minZ) * 0.28 + 0.08
        drawArc(a.city, b.city, alpha)
      }
    }

    /**
     * Draw single particle per arc — 80% transparent (alpha 0.2), with faint glow.
     */
    const drawParticles = (projectedCities: Map<string, { city: City; point: ProjectedPoint }>) => {
      for (const p of particles) {
        const [slugA, slugB] = validPairs[p.pairIndex]
        const a = projectedCities.get(slugA)
        const b = projectedCities.get(slugB)
        if (!a || !b) continue
        const minZ = Math.min(a.point.z, b.point.z)
        if (minZ < -0.5) continue

        const [lat, lng] = slerp(a.city.latitude, a.city.longitude, b.city.latitude, b.city.longitude, p.t)
        const alt = arcAltitude(p.t, a.city, b.city)
        const pt = projectAtAltitude(lat, lng, alt)
        if (!pt.visible) continue

        // 80% transparent: base alpha = 0.2
        const alpha = 0.2
        const dotR = 2.4

        // Soft glow
        const grd = context.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, dotR * 3.5)
        grd.addColorStop(0, `${ORANGE}${alpha})`)
        grd.addColorStop(1, `${ORANGE}0)`)
        context.fillStyle = grd
        context.beginPath()
        context.arc(pt.x, pt.y, dotR * 3.5, 0, Math.PI * 2)
        context.fill()

        // Core dot
        context.fillStyle = `${ORANGE}${alpha})`
        context.beginPath()
        context.arc(pt.x, pt.y, dotR, 0, Math.PI * 2)
        context.fill()
      }
    }

    const draw = (deltaMs: number) => {
      context.clearRect(0, 0, width, height)

      // Sphere base: white
      const glow = context.createRadialGradient(
        centerX - radius * 0.18, centerY - radius * 0.2, radius * 0.05,
        centerX, centerY, radius * 1.1,
      )
      glow.addColorStop(0, '#ffffff')
      glow.addColorStop(0.7, '#f8f8f8')
      glow.addColorStop(1, 'rgba(240,240,240,0)')
      context.fillStyle = glow
      context.beginPath(); context.arc(centerX, centerY, radius * 1.1, 0, Math.PI * 2); context.fill()

      context.fillStyle = '#ffffff'
      context.beginPath(); context.arc(centerX, centerY, radius, 0, Math.PI * 2); context.fill()

      drawGraticule()

      // Land polygons clipped to sphere
      context.save()
      context.beginPath()
      context.arc(centerX, centerY, radius - 0.5, 0, Math.PI * 2)
      context.clip()
      drawLandPolygons()
      context.restore()

      // Rim shading
      const rim = context.createRadialGradient(centerX, centerY, radius * 0.78, centerX, centerY, radius * 1.02)
      rim.addColorStop(0, 'rgba(255,255,255,0)')
      rim.addColorStop(0.88, 'rgba(60,65,75,.03)')
      rim.addColorStop(1, 'rgba(50,55,65,.22)')
      context.fillStyle = rim
      context.beginPath(); context.arc(centerX, centerY, radius * 1.01, 0, Math.PI * 2); context.fill()

      // Build projected city map
      const projectedCities = new Map<string, { city: City; point: ProjectedPoint }>()
      for (const city of cities) {
        projectedCities.set(city.slug, { city, point: project(city.latitude, city.longitude) })
      }

      // Advance particles
      if (!reducedMotion) {
        for (const p of particles) {
          p.t += p.speed * deltaMs
          if (p.t > 1) p.t -= 1
        }
      }

      // Draw arcs and flowing particles (outside sphere clip so arcs extend beyond surface)
      drawCityArcs(projectedCities)
      drawParticles(projectedCities)

      // DOM marker positioning
      for (const [, { city, point }] of projectedCities) {
        const marker = stage.querySelector<HTMLButtonElement>(`[data-city="${city.slug}"]`)
        if (!marker) continue
        marker.style.transform = `translate3d(${point.x}px, ${point.y}px, 0) translate(-50%, -50%) scale(${0.78 + Math.max(0, point.z) * 0.25})`
        marker.style.opacity = point.visible ? String(0.55 + point.z * 0.45) : '0'
        marker.style.pointerEvents = point.visible ? 'auto' : 'none'
        marker.style.zIndex = String(Math.round(point.z * 100))
      }
    }

    const animate = (time: number) => {
      if (cancelled) return
      const deltaMs = lastTime === 0 ? 16 : Math.min(time - lastTime, 64)
      lastTime = time
      if (!dragging && !activeCity.current && !reducedMotion && time - lastInteraction.current > 1800) {
        target.current.longitude += 0.018
      }
      currentLongitude += (target.current.longitude - currentLongitude) * (reducedMotion ? 1 : 0.075)
      currentLatitude += (target.current.latitude - currentLatitude) * (reducedMotion ? 1 : 0.075)
      // Smooth zoom interpolation
      currentZoom += (targetZoom - currentZoom) * (reducedMotion ? 1 : 0.12)
      radius = baseRadius * currentZoom
      draw(deltaMs)
      animationFrame = requestAnimationFrame(animate)
    }

    const onPointerDown = (event: PointerEvent) => {
      if (event.target instanceof Element && event.target.closest('button')) return
      dragging = true
      dragStartX = event.clientX
      dragStartY = event.clientY
      dragLongitude = target.current.longitude
      dragLatitude = target.current.latitude
      stage.setPointerCapture(event.pointerId)
      stage.classList.add('is-dragging')
      activeCity.current = null
      lastInteraction.current = performance.now()
    }
    const onPointerMove = (event: PointerEvent) => {
      if (!dragging) return
      target.current.longitude = dragLongitude - (event.clientX - dragStartX) * 0.28
      target.current.latitude = Math.max(-55, Math.min(55, dragLatitude + (event.clientY - dragStartY) * 0.2))
      lastInteraction.current = performance.now()
    }
    const onPointerEnd = (event: PointerEvent) => {
      if (!dragging) return
      dragging = false
      stage.classList.remove('is-dragging')
      if (stage.hasPointerCapture(event.pointerId)) stage.releasePointerCapture(event.pointerId)
    }

    const onWheel = (event: WheelEvent) => {
      event.preventDefault()
      const delta = event.deltaY > 0 ? -0.08 : 0.08
      targetZoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, targetZoom + delta))
      lastInteraction.current = performance.now()
    }

    stage.addEventListener('pointerdown', onPointerDown)
    stage.addEventListener('pointermove', onPointerMove)
    stage.addEventListener('pointerup', onPointerEnd)
    stage.addEventListener('pointercancel', onPointerEnd)
    stage.addEventListener('wheel', onWheel, { passive: false })
    const observer = new ResizeObserver(resize)
    observer.observe(stage)
    resize()

    void fetch('/textures/land-polygons.json')
      .then((response) => response.json() as Promise<LandPolygons>)
      .then((data) => {
        if (cancelled) return
        landPolygons = data
      })
      .catch(() => { landPolygons = [] })

    animationFrame = requestAnimationFrame(animate)

    return () => {
      cancelled = true
      cancelAnimationFrame(animationFrame)
      observer.disconnect()
      stage.removeEventListener('pointerdown', onPointerDown)
      stage.removeEventListener('pointermove', onPointerMove)
      stage.removeEventListener('pointerup', onPointerEnd)
      stage.removeEventListener('pointercancel', onPointerEnd)
      stage.removeEventListener('wheel', onWheel)
    }
  }, [canvasRef, cities, stageRef])

  return null
})

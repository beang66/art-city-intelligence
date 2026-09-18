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

    let earthPoints: { longitude: number; latitude: number }[] = []
    let width = 0
    let height = 0
    let radius = 0
    let centerX = 0
    let centerY = 0
    let currentLongitude = 28
    let currentLatitude = 17
    let pointerX = 0
    let pointerY = 0
    let pointerActive = false
    let dragging = false
    let dragStartX = 0
    let dragStartY = 0
    let dragLongitude = 0
    let dragLatitude = 0
    let animationFrame = 0
    let cancelled = false
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    lastInteraction.current = performance.now()

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
      radius = Math.min(width * 0.38, height * 0.43)
      centerX = width * 0.52
      centerY = height * 0.48
    }

    const project = (latitude: number, longitude: number): ProjectedPoint => {
      const radians = Math.PI / 180
      const phi = latitude * radians
      const originPhi = currentLatitude * radians
      const lambda = (longitude - currentLongitude) * radians
      const cosPhi = Math.cos(phi)
      const x = cosPhi * Math.sin(lambda)
      const y = Math.cos(originPhi) * Math.sin(phi) - Math.sin(originPhi) * cosPhi * Math.cos(lambda)
      const z = Math.sin(originPhi) * Math.sin(phi) + Math.cos(originPhi) * cosPhi * Math.cos(lambda)
      return {
        x: centerX + x * radius + (pointerActive ? pointerX * 7 : 0),
        y: centerY - y * radius + (pointerActive ? pointerY * 5 : 0),
        z,
        visible: z > 0.02,
      }
    }

    const drawGraticule = () => {
      context.lineWidth = 0.65
      context.strokeStyle = 'rgba(74,84,98,.12)'
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

    const drawConnections = (projectedCities: { city: City; point: ProjectedPoint }[]) => {
      if (!pointerActive || dragging) return
      const pointer = { x: (pointerX + 1) * width / 2, y: (pointerY + 1) * height / 2 }
      const nearest = projectedCities
        .filter((item) => item.point.visible)
        .sort((a, b) => Math.hypot(a.point.x - pointer.x, a.point.y - pointer.y) - Math.hypot(b.point.x - pointer.x, b.point.y - pointer.y))
        .slice(0, 3)
      nearest.forEach((item, index) => {
        context.beginPath()
        context.moveTo(item.point.x, item.point.y)
        context.quadraticCurveTo((item.point.x + pointer.x) / 2 + (index - 1) * 18, pointer.y - 24 - index * 10, pointer.x, pointer.y)
        context.strokeStyle = `rgba(25,84,196,${0.3 - index * 0.07})`
        context.lineWidth = 1
        context.stroke()
      })
    }

    const draw = (time: number) => {
      context.clearRect(0, 0, width, height)
      const glow = context.createRadialGradient(centerX - radius * 0.2, centerY - radius * 0.22, radius * 0.05, centerX, centerY, radius * 1.14)
      glow.addColorStop(0, '#ffffff')
      glow.addColorStop(0.5, '#f1f2f2')
      glow.addColorStop(0.9, '#e5e7e8')
      glow.addColorStop(1, 'rgba(229,231,232,0)')
      context.fillStyle = glow
      context.beginPath(); context.arc(centerX, centerY, radius * 1.12, 0, Math.PI * 2); context.fill()
      context.fillStyle = '#f3f4f4'
      context.beginPath(); context.arc(centerX, centerY, radius, 0, Math.PI * 2); context.fill()
      drawGraticule()

      earthPoints.forEach((geo, index) => {
        const point = project(geo.latitude, geo.longitude)
        if (!point.visible) return
        const shimmer = reducedMotion ? 0 : Math.sin(time * 0.0013 + index * 0.67) * 0.035
        context.fillStyle = `rgba(46,55,67,${Math.max(0.1, point.z * 0.32 + shimmer)})`
        context.beginPath(); context.arc(point.x, point.y, 0.45 + point.z * 0.72, 0, Math.PI * 2); context.fill()
      })

      const rim = context.createRadialGradient(centerX, centerY, radius * 0.72, centerX, centerY, radius * 1.04)
      rim.addColorStop(0, 'rgba(255,255,255,0)')
      rim.addColorStop(0.9, 'rgba(69,79,91,.02)')
      rim.addColorStop(1, 'rgba(69,79,91,.22)')
      context.fillStyle = rim
      context.beginPath(); context.arc(centerX, centerY, radius * 1.02, 0, Math.PI * 2); context.fill()

      const projectedCities = cities.map((city) => ({ city, point: project(city.latitude, city.longitude) }))
      earthPoints.forEach((geo, index) => {
        if (index % 43) return
        const point = project(geo.latitude, geo.longitude)
        if (!point.visible || point.z < 0.16) return
        const deltaX = point.x - centerX
        const deltaY = point.y - centerY
        const magnitude = Math.hypot(deltaX, deltaY) || 1
        const length = 5 + Math.abs(Math.sin(index * 1.73)) * 22 * point.z
        context.beginPath(); context.moveTo(point.x, point.y); context.lineTo(point.x + deltaX / magnitude * length, point.y + deltaY / magnitude * length)
        context.strokeStyle = `rgba(25,84,196,${0.15 + point.z * 0.35})`
        context.lineWidth = 0.8; context.stroke()
      })
      projectedCities.forEach(({ city, point }) => {
        if (!point.visible) return
        const deltaX = point.x - centerX
        const deltaY = point.y - centerY
        const magnitude = Math.hypot(deltaX, deltaY) || 1
        const length = 24 + (city.index - 65) * 1.25
        context.beginPath(); context.moveTo(point.x, point.y); context.lineTo(point.x + deltaX / magnitude * length, point.y + deltaY / magnitude * length)
        context.strokeStyle = 'rgba(18,72,176,.88)'; context.lineWidth = 1.4; context.stroke()
      })
      drawConnections(projectedCities)
      projectedCities.forEach(({ city, point }) => {
        const marker = stage.querySelector<HTMLButtonElement>(`[data-city="${city.slug}"]`)
        if (!marker) return
        marker.style.transform = `translate3d(${point.x}px, ${point.y}px, 0) translate(-50%, -50%) scale(${0.78 + Math.max(0, point.z) * 0.25})`
        marker.style.opacity = point.visible ? String(0.55 + point.z * 0.45) : '0'
        marker.style.pointerEvents = point.visible ? 'auto' : 'none'
        marker.style.zIndex = String(Math.round(point.z * 100))
      })
    }

    const animate = (time: number) => {
      if (cancelled) return
      if (!dragging && !activeCity.current && !reducedMotion && time - lastInteraction.current > 1800) target.current.longitude += 0.018
      currentLongitude += (target.current.longitude - currentLongitude) * (reducedMotion ? 1 : 0.075)
      currentLatitude += (target.current.latitude - currentLatitude) * (reducedMotion ? 1 : 0.075)
      draw(time)
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
      const rect = stage.getBoundingClientRect()
      pointerX = ((event.clientX - rect.left) / rect.width) * 2 - 1
      pointerY = ((event.clientY - rect.top) / rect.height) * 2 - 1
      pointerActive = true
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
    const onPointerLeave = () => { pointerActive = false }

    stage.addEventListener('pointerdown', onPointerDown)
    stage.addEventListener('pointermove', onPointerMove)
    stage.addEventListener('pointerup', onPointerEnd)
    stage.addEventListener('pointercancel', onPointerEnd)
    stage.addEventListener('pointerleave', onPointerLeave)
    const observer = new ResizeObserver(resize)
    observer.observe(stage)
    resize()

    void fetch('/textures/earth-points.json')
      .then((response) => response.json() as Promise<number[]>)
      .then((raw) => {
        if (cancelled) return
        for (let index = 0; index < raw.length; index += 2) earthPoints.push({ longitude: raw[index] / 10, latitude: raw[index + 1] / 10 })
      })
      .catch(() => { earthPoints = [] })
    animationFrame = requestAnimationFrame(animate)

    return () => {
      cancelled = true
      cancelAnimationFrame(animationFrame)
      observer.disconnect()
      stage.removeEventListener('pointerdown', onPointerDown)
      stage.removeEventListener('pointermove', onPointerMove)
      stage.removeEventListener('pointerup', onPointerEnd)
      stage.removeEventListener('pointercancel', onPointerEnd)
      stage.removeEventListener('pointerleave', onPointerLeave)
    }
  }, [canvasRef, cities, stageRef])

  return null
})

import type { NextConfig } from 'next'

// FastAPI (backend/) serves every /api/* route. Locally: uvicorn on :8000. On Vercel: the Render URL.
const apiOrigin = process.env.API_ORIGIN ?? (process.env.VERCEL ? '' : 'http://127.0.0.1:8000')
if (!apiOrigin) throw new Error('API_ORIGIN is not set: point it at the FastAPI service (e.g. https://art-city-intelligence-api.onrender.com).')

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typedRoutes: true,
  allowedDevOrigins: ['127.0.0.1'],
  async rewrites() {
    return [{ source: '/api/:path*', destination: `${apiOrigin}/api/:path*` }]
  },
}

export default nextConfig

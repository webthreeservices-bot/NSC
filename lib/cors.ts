import { NextResponse } from 'next/server'

// Get allowed origins from environment or use localhost for development
const getAllowedOrigin = () => {
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
    process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  ]

  // In production, never allow all origins
  if (process.env.NODE_ENV === 'production' && allowedOrigins.includes('*')) {
    throw new Error('CORS: Wildcard origin (*) is not allowed in production')
  }

  return allowedOrigins[0] // Return first allowed origin
}

export function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': getAllowedOrigin(),
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true', // Required for cookies
  }
}

export function handleCors(response: NextResponse) {
  Object.entries(corsHeaders()).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  return response
}

export function handleOptions() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders(),
  })
}

import { NextRequest, NextResponse } from 'next/server'

// Catch-all route for undefined API endpoints
// This handles all requests that don't match any existing API routes

export async function GET(request: NextRequest) {
  return NextResponse.json(
    {
      error: 'API endpoint not found',
      message: 'The requested API endpoint does not exist',
      statusCode: 404,
      path: request.nextUrl.pathname
    },
    { status: 404 }
  )
}

export async function POST(request: NextRequest) {
  return NextResponse.json(
    {
      error: 'API endpoint not found',
      message: 'The requested API endpoint does not exist',
      statusCode: 404,
      path: request.nextUrl.pathname
    },
    { status: 404 }
  )
}

export async function PUT(request: NextRequest) {
  return NextResponse.json(
    {
      error: 'API endpoint not found',
      message: 'The requested API endpoint does not exist',
      statusCode: 404,
      path: request.nextUrl.pathname
    },
    { status: 404 }
  )
}

export async function DELETE(request: NextRequest) {
  return NextResponse.json(
    {
      error: 'API endpoint not found',
      message: 'The requested API endpoint does not exist',
      statusCode: 404,
      path: request.nextUrl.pathname
    },
    { status: 404 }
  )
}

export async function PATCH(request: NextRequest) {
  return NextResponse.json(
    {
      error: 'API endpoint not found',
      message: 'The requested API endpoint does not exist',
      statusCode: 404,
      path: request.nextUrl.pathname
    },
    { status: 404 }
  )
}

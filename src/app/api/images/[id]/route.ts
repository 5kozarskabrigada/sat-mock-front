import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'

// PostgreSQL connection pool
let pool: Pool | null = null

function getDbPool() {
  if (!pool) {
    const databaseUrl = process.env.DATABASE_URL || process.env.NEXT_PUBLIC_DATABASE_URL
    
    if (!databaseUrl) {
      throw new Error('Missing DATABASE_URL environment variable')
    }
    
    pool = new Pool({
      connectionString: databaseUrl,
      ssl: databaseUrl.includes('neon.tech') ? { rejectUnauthorized: false } : undefined,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    })
  }
  
  return pool
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return new NextResponse('Image ID is required', { status: 400 })
    }

    const db = getDbPool()
    const result = await db.query(
      `SELECT data, content_type, filename 
       FROM images 
       WHERE id = $1`,
      [id]
    )

    if (result.rows.length === 0) {
      return new NextResponse('Image not found', { status: 404 })
    }

    const { data, content_type, filename } = result.rows[0]

    // Return image with appropriate headers
    return new NextResponse(data, {
      status: 200,
      headers: {
        'Content-Type': content_type,
        'Content-Disposition': `inline; filename="${filename}"`,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error: any) {
    console.error('Image retrieval error:', error)
    return new NextResponse('Failed to retrieve image', { status: 500 })
  }
}

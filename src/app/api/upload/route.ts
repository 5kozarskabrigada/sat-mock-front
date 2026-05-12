import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']

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

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 })
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 })
    }

    const extension = file.name.split('.').pop()?.toLowerCase() || 'bin'
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`
    
    const bytes = await file.arrayBuffer()
    const fileBuffer = Buffer.from(bytes)

    // Store in PostgreSQL
    const db = getDbPool()
    const result = await db.query(
      `INSERT INTO images (filename, content_type, file_size, data) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id`,
      [filename, file.type, file.size, fileBuffer]
    )

    const imageId = result.rows[0].id

    // Return URL that points to our image serving API
    const imageUrl = `${process.env.NEXT_PUBLIC_API_URL || ''}/api/images/${imageId}`

    return NextResponse.json({ url: imageUrl })
  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}

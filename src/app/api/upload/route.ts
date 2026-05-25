import { NextRequest, NextResponse } from 'next/server'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']

function withApiPrefix(url: string): string {
  const trimmed = url.replace(/\/+$/, '')
  if (trimmed.endsWith('/api')) {
    return trimmed
  }
  return `${trimmed}/api`
}

function buildImageUrl(apiBaseUrl: string, backendPath: string): string {
  if (/^https?:\/\//i.test(backendPath)) {
    return backendPath
  }

  const normalizedApiBase = withApiPrefix(apiBaseUrl)
  const normalizedPath = backendPath.startsWith('/') ? backendPath : `/${backendPath}`

  // Backend returns /api/images/:id. If api base already ends with /api, avoid duplicating it.
  const pathWithoutApiPrefix = normalizedPath.startsWith('/api/')
    ? normalizedPath.slice('/api'.length)
    : normalizedPath

  return `${normalizedApiBase}${pathWithoutApiPrefix}`
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

    // Forward to backend API
    const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
    const apiUrl = withApiPrefix(rawApiUrl)
    const backendFormData = new FormData()
    backendFormData.append('file', file)

    const response = await fetch(`${apiUrl}/images/upload`, {
      method: 'POST',
      body: backendFormData,
    })

    if (!response.ok) {
      let message = 'Upload failed'
      try {
        const error = await response.json()
        message = error?.message || error?.error || message
      } catch {
        // Keep default message when backend response is not JSON.
      }
      return NextResponse.json({ error: message }, { status: response.status })
    }

    const result = await response.json()
    
        // Return full URL that works whether NEXT_PUBLIC_API_URL contains /api or not.
        return NextResponse.json({ 
      url: buildImageUrl(rawApiUrl, result.url),
      id: result.id 
        })
  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}


'use server'

import { prisma } from '@/lib/prisma'
import * as bcrypt from 'bcrypt'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  try {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        role: true,
      },
    })

    if (!user) {
      return { error: 'Invalid username or password' }
    }

    // Find account with password
    const account = await prisma.account.findFirst({
      where: {
        userId: user.id,
        providerId: 'credential',
      },
      select: {
        password: true,
      },
    })

    if (!account || !account.password) {
      return { error: 'Invalid username or password' }
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, account.password)
    if (!passwordMatch) {
      return { error: 'Invalid username or password' }
    }

    // Create session manually
    const sessionToken = crypto.randomUUID()
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

    await prisma.session.create({
      data: {
        userId: user.id,
        token: sessionToken,
        expiresAt,
        ipAddress: null,
        userAgent: null,
      },
    })

    // Set session cookie
    const cookieStore = await cookies()
    cookieStore.set('better-auth.session_token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: expiresAt,
      path: '/',
    })

    // Redirect based on role
    if (user.role === 'admin') {
      return { success: true, redirectUrl: '/admin' }
    } else {
      return { success: true, redirectUrl: '/student' }
    }
  } catch (error) {
    console.error('Login error:', error)
    return { error: 'Invalid username or password' }
  }
}


'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import bcrypt from 'bcrypt'

function generatePassword(length = 12) {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  let retVal = "";
  for (let i = 0, n = charset.length; i < length; ++i) {
    retVal += charset.charAt(Math.floor(Math.random() * n));
  }
  return retVal;
}

function generateUsername(firstName: string, lastName: string) {
  const base = `${firstName.toLowerCase()}.${lastName.toLowerCase()}`.replace(/[^a-z0-9.]/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `${base}${randomSuffix}`;
}

export async function createStudent(prevState: any, formData: FormData) {
  const firstName = formData.get('firstName') as string
  const lastName = formData.get('lastName') as string

  if (!firstName || !lastName) {
    return { error: 'First name and last name are required' }
  }

  const username = generateUsername(firstName, lastName)
  const password = generatePassword()
  const email = `${username}@sat-platform.local`

  try {
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user and account in Prisma
    const user = await prisma.user.create({
      data: {
        email,
        username,
        firstName,
        lastName,
        role: 'student',
        emailVerified: new Date(),
        accounts: {
          create: {
            accountId: email,
            providerId: 'credential',
            password: hashedPassword,
          },
        },
      },
    })

    revalidatePath('/admin/students')

    return {
      success: true,
      credentials: {
        username,
        password,
        firstName,
        lastName
      }
    }
  } catch (err: any) {
    console.error('Unexpected error:', err)
    return { error: err.message || 'An unexpected error occurred' }
  }
}

export async function deleteStudent(studentId: string) {
  try {
    console.log(`[deleteStudent] Attempting to delete student ${studentId}`)

    // Delete user - cascades to accounts, sessions, and other related data via Prisma schema
    await prisma.user.delete({
      where: { id: studentId },
    })

    console.log(`[deleteStudent] Successfully deleted student ${studentId}`)
    revalidatePath('/admin/students')
    return { success: true }
  } catch (err: any) {
    console.error('[deleteStudent] Unexpected error:', err)
    return { error: `Unexpected error: ${err.message}` }
  }
}

export async function updateStudent(studentId: string, formData: FormData) {
    try {
        const firstName = formData.get('firstName') as string
        const lastName = formData.get('lastName') as string
        const password = formData.get('password') as string

        console.log(`[updateStudent] Updating student ${studentId}`)

        // Update user profile
        await prisma.user.update({
            where: { id: studentId },
            data: {
                firstName,
                lastName,
            },
        })

        // Update password if provided
        if (password && password.trim().length > 0) {
            const hashedPassword = await bcrypt.hash(password, 10)
            
            await prisma.account.updateMany({
                where: {
                    userId: studentId,
                    providerId: 'credential',
                },
                data: {
                    password: hashedPassword,
                },
            })
        }

        console.log(`[updateStudent] Successfully updated student ${studentId}`)
        revalidatePath('/admin/students')
        return { success: true }

    } catch (err: any) {
        console.error('[updateStudent] Unexpected error:', err)
        return { error: `Unexpected error: ${err.message}` }
    }
}

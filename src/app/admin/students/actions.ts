
import { usersAPI } from '@/lib/api-client';

export function generatePassword(length = 12) {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  let retVal = "";
  for (let i = 0, n = charset.length; i < length; ++i) {
    retVal += charset.charAt(Math.floor(Math.random() * n));
  }
  return retVal;
}

export function generateUsername(firstName: string, lastName: string) {
  const base = `${firstName.toLowerCase()}.${lastName.toLowerCase()}`.replace(/[^a-z0-9.]/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `${base}${randomSuffix}`;
}

export async function createStudent(firstName: string, lastName: string) {
  if (!firstName || !lastName) {
    return { error: 'First name and last name are required' };
  }

  const username = generateUsername(firstName, lastName);
  const password = generatePassword();
  const email = `${username}@sat-platform.local`;

  try {
    const response = await usersAPI.create({
      email,
      username,
      firstName,
      lastName,
      password,
      role: 'student',
    });

    return {
      success: true,
      credentials: {
        username,
        password,
        firstName,
        lastName
      }
    };
  } catch (err: any) {
    console.error('Unexpected error:', err);
    return { error: err.response?.data?.message || err.message || 'An unexpected error occurred' };
  }
}

export async function deleteStudent(studentId: string) {
  try {
    console.log(`[deleteStudent] Attempting to delete student ${studentId}`);

    await usersAPI.delete(studentId);

    console.log(`[deleteStudent] Successfully deleted student ${studentId}`);
    return { success: true };
  } catch (err: any) {
    console.error('[deleteStudent] Unexpected error:', err);
    return { error: err.response?.data?.message || `Unexpected error: ${err.message}` };
  }
}

export async function updateStudent(studentId: string, data: { firstName: string; lastName: string; password?: string }) {
    try {
        console.log(`[updateStudent] Updating student ${studentId}`);

        await usersAPI.update(studentId, data);

        console.log(`[updateStudent] Successfully updated student ${studentId}`);
        return { success: true };

    } catch (err: any) {
        console.error('[updateStudent] Unexpected error:', err);
        return { error: err.response?.data?.message || `Unexpected error: ${err.message}` };
    }
}

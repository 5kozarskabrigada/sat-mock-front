import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { prisma } from '@/lib/prisma';

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  user: {
    fields: {
      email: 'email',
      name: 'username',
      emailVerified: 'emailVerified',
    },
    additionalFields: {
      role: {
        type: 'string',
        required: true,
        defaultValue: 'student',
      },
      firstName: {
        type: 'string',
        required: false,
        fieldName: 'firstName',
      },
      lastName: {
        type: 'string',
        required: false,
        fieldName: 'lastName',
      },
      username: {
        type: 'string',
        required: false,
      },
    },
  },
  account: {
    fields: {
      accountId: 'accountId',
      providerId: 'providerId',
      userId: 'userId',
      accessToken: 'accessToken',
      refreshToken: 'refreshToken',
      idToken: 'idToken',
      password: 'password',
    },
  },
  session: {
    fields: {
      userId: 'userId',
      expiresAt: 'expiresAt',
      token: 'token',
      ipAddress: 'ipAddress',
      userAgent: 'userAgent',
    },
  },
});

export type Session = typeof auth.$Infer.Session;

import { z } from 'zod';

export const ZCuid = z.object({
  id: z.cuid({ message: 'Invalid UUID format for id parameter' }),
});

export const ZGQuery = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  sortBy: z.string().default('createdAt'),
  orderBy: z.enum(['asc', 'desc']).default('desc'),
});

// ------------------ REGISTER VALIDATORS ------------------

export const ZRegister = z.object({
  email: z.email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
});

export const ZLogin = z.object({
  email: z.email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

// ------------------ UPDATE USER VALIDATOR ------------------

export const ZCUser = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  image: z.string().optional(),
  isVerified: z.boolean().default(false).optional(),
});

export const ZUUser = ZCUser.partial();

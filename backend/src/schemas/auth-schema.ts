import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email({ message: 'Email must be a valid email address' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters long' }),
  name: z.string().trim().min(1, { message: 'Name is required' }),
});

export const loginSchema = z.object({
  email: z.string().email({ message: 'Email must be a valid email address' }),
  password: z.string().min(1, { message: 'Password is required' }),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

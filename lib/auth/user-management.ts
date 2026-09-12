import { z } from 'zod';

const fullName = z.string().trim().min(1, 'Full name is required').max(200);
const password = z.string().min(8, 'Password must be at least 8 characters').max(128);
const role = z.enum(['admin', 'staff', 'writer', 'allotment']);

export const createUserSchema = z.object({
  email: z.string().trim().email('A valid email address is required').max(254),
  password,
  fullName,
  role,
});

export const updateUserSchema = z.object({
  userId: z.string().uuid('A valid user ID is required'),
  fullName: fullName.optional(),
  role: role.optional(),
  password: password.optional(),
}).refine((data) => data.fullName !== undefined || data.role !== undefined || data.password !== undefined, {
  message: 'At least one update is required',
});

export const deleteUserSchema = z.object({
  userId: z.string().uuid('A valid user ID is required'),
});

export const userStatusSchema = z.object({
  id: z.string().uuid('A valid user ID is required'),
  is_active: z.boolean(),
});

export const setupAdminSchema = createUserSchema.omit({ role: true }).extend({
  password: password.min(12, 'Bootstrap password must be at least 12 characters'),
});

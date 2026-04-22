import { z } from 'zod';
import { emailSchema } from './email';
import { passwordSchema } from './password';

/** Schema Zod para o formulário de Login */
export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export type LoginFormData = z.infer<typeof loginSchema>;

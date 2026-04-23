import { z } from "zod";

export const categorySchema = z.object({
  name: z.string()
    .min(3, "O nome da categoria deve ter no mínimo 3 caracteres.")
    .max(50, "O nome da categoria deve ter no máximo 50 caracteres."),
});

export type CategoryFormData = z.infer<typeof categorySchema>;

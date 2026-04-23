import { z } from 'zod';

export const productSchema = z.object({
  title: z.string().min(3, "O título deve ter no mínimo 3 caracteres").max(100, "O título deve ter no máximo 100 caracteres"),
  description: z.string().optional().nullable(),
  pricePerDay: z.number().min(0, "O preço não pode ser negativo").or(z.string().transform(val => parseFloat(val)).refine(val => !isNaN(val) && val >= 0, "Preço inválido")),
  categoryIds: z.array(z.string()).min(1, "Selecione pelo menos uma categoria")
});

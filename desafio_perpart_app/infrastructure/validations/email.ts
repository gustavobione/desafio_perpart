import { z } from "zod";

/** Schema Zod reutilizável para E-mail */
export const emailSchema = z.string().email("E-mail inválido").min(1, "O E-mail é obrigatório")
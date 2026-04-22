import { z } from "zod";

/** Schema Zod reutilizável para E-mail */
export const emailSchema = z.string().regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "E-mail inválido").min(1, "O E-mail é obrigatório")
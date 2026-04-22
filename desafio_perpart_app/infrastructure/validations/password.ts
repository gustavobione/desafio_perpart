import { z } from "zod";

/** Schema Zod reutilizável para Senha */
export const passwordSchema = z
    .string()
    .min(6, "A senha deve ter no mínimo 6 caracteres")
    .max(20, "A senha pode ter no máximo 20 caracteres")
    .regex(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&#^%])[A-Za-z\d@$!%*?&#^%]+$/, "A senha deve conter letra maiúscula, minúscula, número e caractere especial")
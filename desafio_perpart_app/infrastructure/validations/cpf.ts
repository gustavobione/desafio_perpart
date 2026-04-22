import { z } from "zod";

export function isValidCPF(cpf: string): boolean {
  // Remove pontuação
  cpf = cpf.replace(/[^d]/g, "");

  // Rejeita se não tiver 11 dígitos ou for uma sequência repetida
  if (!cpf || cpf.length !== 11 || /^(d)\1{10}$/.test(cpf)) return false;

  // Cálculo do primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let firstDigit = 11 - (sum % 11);
  if (firstDigit >= 10) firstDigit = 0;

  // Verifica se o primeiro dígito está correto
  if (firstDigit !== parseInt(cpf.charAt(9))) return false;

  // Cálculo do segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i);
  }
  let secondDigit = 11 - (sum % 11);
  if (secondDigit >= 10) secondDigit = 0;

  // Verifica se o segundo dígito está correto
  return secondDigit === parseInt(cpf.charAt(10));
}

/** Schema Zod reutilizável para CPF formatado */
export const cpfSchema = z
  .string()
  .min(1, "CPF é obrigatório")
  .refine((val) => /^d{3}.d{3}.d{3}-d{2}$/.test(val), {
    message: "Formato de CPF inválido",
  })
  .refine((val) => isValidCPF(val), {
    message: "CPF inválido",
  });
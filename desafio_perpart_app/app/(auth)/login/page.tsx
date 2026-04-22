"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";

import {
  Button,
  Card,
  FlexContainer,
  InputPassword,
  InputText,
  TextLink,
  Typography,
} from "@uigovpe/components";

import { login } from "@/lib/api/auth.api";
import { useAuthStore } from "@/store/auth.store";
import { useTheme } from "@/context/ThemeContext";
import {
  loginSchema,
  type LoginFormData,
} from "@/infrastructure/validations/login";

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const { isDark } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setApiError(null);

    try {
      const response = await login({
        email: data.email,
        password: data.password,
      });
      setAuth(response.access_token, response.user);
      router.replace("/dashboard");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        setApiError("E-mail ou senha inválidos. Tente novamente.");
      } else {
        setApiError(
          "Erro ao conectar com o servidor. Tente novamente mais tarde.",
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex" style={{ minHeight: "calc(100vh - 40px)" }}>
      {/* ── Lado esquerdo: Branding (oculto no mobile) ── */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-12 gap-6"
        style={{ backgroundColor: "var(--color-surface-primary-default)" }}
      >
        <span
          className="material-symbols-outlined select-none"
          style={{ fontSize: "96px", color: "var(--color-text-bright)" }}
        >
          casino
        </span>

        <div className="text-center">
          <h1
            className="text-4xl font-bold"
            style={{ color: "var(--color-text-bright)" }}
          >
            Ludoboard
          </h1>
          <p
            className="text-lg mt-2"
            style={{ color: "var(--color-text-bright)", opacity: 0.8 }}
          >
            Aluguel de Jogos de Tabuleiro
          </p>
          <p
            className="text-sm mt-4 max-w-xs mx-auto"
            style={{ color: "var(--color-text-bright)", opacity: 0.6 }}
          >
            Encontre, alugue e compartilhe jogos de tabuleiro perto de você.
          </p>
        </div>
      </div>

      {/* ── Lado direito: Formulário ── */}
      <div
        className="flex flex-col items-center justify-center w-full lg:w-1/2 p-4 lg:p-8"
        style={{
          backgroundColor: isDark
            ? "var(--color-background-darker)"
            : "var(--color-background-default)",
        }}
      >
        {/* Logo visível apenas no mobile */}
        <div className="lg:hidden mb-8 flex flex-col items-center text-center gap-2">
          <span
            className="material-symbols-outlined select-none"
            style={{
              fontSize: "64px",
              color: "var(--color-surface-primary-default)",
            }}
          >
            casino
          </span>
          <h2
            className="text-2xl font-bold"
            style={{ color: "var(--color-text-primary)" }}
          >
            Ludoboard
          </h2>
        </div>

        <div className="w-full max-w-md">
          <Card title="Entrar na plataforma">
            {/* Erro da API */}
            {apiError && (
              <div
                className="mb-4 p-3 rounded-md text-sm"
                style={{
                  backgroundColor: "var(--color-background-feedback-danger)",
                  color: "var(--color-text-danger)",
                  border: "1px solid var(--color-outline-danger)",
                }}
              >
                {apiError}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="mt-4" noValidate>
              <FlexContainer
                direction="col"
                gap="4"
                justify="center"
                align="start"
              >
                <div className="w-full mb-4">
                  <Controller
                    name="email"
                    control={control}
                    render={({ field }) => (
                      <InputText
                        {...field}
                        id="email"
                        label="E-mail"
                        placeholder="seu@email.com"
                        invalid={!!errors.email}
                        supportText={errors.email?.message}
                      />
                    )}
                  />
                </div>

                <div className="w-full mb-6">
                  <Controller
                    name="password"
                    control={control}
                    render={({ field }) => (
                      <InputPassword
                        {...field}
                        id="password"
                        label="Senha"
                        placeholder="Digite sua senha"
                        invalid={!!errors.password}
                        supportText={errors.password?.message}
                      />
                    )}
                  />
                </div>

                <Button
                  type="submit"
                  label="Entrar"
                  className="w-full"
                  loading={isLoading}
                />

                <Typography
                  variant="div"
                  textAlign="center"
                  className="w-full mt-4"
                >
                  {"Não tem uma conta? "}
                  <TextLink onClick={() => router.push("/register")}>
                    Cadastre-se
                  </TextLink>
                </Typography>
              </FlexContainer>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}

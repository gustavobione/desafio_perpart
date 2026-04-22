'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';

import {
  Button,
  Card,
  FlexContainer,
  InputPassword,
  InputText,
  TextLink,
  Typography,
} from '@uigovpe/components';

import { register } from '@/lib/api/auth.api';
import { useAuthStore } from '@/store/auth.store';
import { useTheme } from '@/context/ThemeContext';
import { registerSchema, type RegisterFormData } from '@/infrastructure/validations/register';

export default function RegisterPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const { isDark } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setApiError(null);

    try {
      const response = await register({
        name: data.name,
        email: data.email,
        password: data.password,
      });
      setAuth(response.access_token, response.user);
      router.replace('/dashboard');
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        setApiError('Este e-mail já está em uso. Tente com outro.');
      } else {
        setApiError('Erro ao criar conta. Tente novamente mais tarde.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex" style={{ minHeight: 'calc(100vh - 40px)' }}>
      {/* ── Lado esquerdo: Branding (oculto no mobile) ── */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-12 gap-6"
        style={{ backgroundColor: 'var(--color-surface-primary-default)' }}
      >
        <span
          className="material-symbols-outlined select-none"
          style={{ fontSize: '96px', color: 'var(--color-text-bright)' }}
        >
          casino
        </span>

        <div className="text-center">
          <h1
            className="text-4xl font-bold"
            style={{ color: 'var(--color-text-bright)' }}
          >
            Ludoboard
          </h1>
          <p
            className="text-lg mt-2"
            style={{ color: 'var(--color-text-bright)', opacity: 0.8 }}
          >
            Aluguel de Jogos de Tabuleiro
          </p>
          <p
            className="text-sm mt-4 max-w-xs mx-auto"
            style={{ color: 'var(--color-text-bright)', opacity: 0.6 }}
          >
            Crie sua conta e comece a explorar nossa coleção de jogos.
          </p>
        </div>
      </div>

      {/* ── Lado direito: Formulário ── */}
      <div
        className="flex flex-col items-center justify-center w-full lg:w-1/2 p-4 lg:p-8"
        style={{ backgroundColor: isDark ? 'var(--color-background-darker)' : 'var(--color-background-default)' }}
      >
        {/* Logo visível apenas no mobile */}
        <div className="lg:hidden mb-8 flex flex-col items-center text-center gap-2">
          <span
            className="material-symbols-outlined select-none"
            style={{ fontSize: '64px', color: 'var(--color-surface-primary-default)' }}
          >
            casino
          </span>
          <h2
            className="text-2xl font-bold"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Ludoboard
          </h2>
        </div>

        <div className="w-full max-w-md">
          <Card title="Criar conta">
            {/* Erro da API */}
            {apiError && (
              <div
                className="mb-4 p-3 rounded-md text-sm"
                style={{
                  backgroundColor: 'var(--color-background-feedback-danger)',
                  color: 'var(--color-text-danger)',
                  border: '1px solid var(--color-outline-danger)',
                }}
              >
                {apiError}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="mt-4" noValidate>
              <FlexContainer direction="col" gap="4" justify="center" align="start">
                <div className="w-full">
                  <Controller
                    name="name"
                    control={control}
                    render={({ field }) => (
                      <InputText
                        {...field}
                        id="name"
                        label="Nome completo"
                        placeholder="Seu nome"
                        invalid={!!errors.name}
                        supportText={errors.name?.message}
                      />
                    )}
                  />
                </div>

                <div className="w-full">
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

                <div className="w-full">
                  <Controller
                    name="password"
                    control={control}
                    render={({ field }) => (
                      <InputPassword
                        {...field}
                        id="password"
                        label="Senha"
                        placeholder="Mínimo 6 caracteres"
                        invalid={!!errors.password}
                        supportText={errors.password?.message}
                      />
                    )}
                  />
                </div>

                <div className="w-full">
                  <Controller
                    name="confirmPassword"
                    control={control}
                    render={({ field }) => (
                      <InputPassword
                        {...field}
                        id="confirmPassword"
                        label="Confirmar senha"
                        placeholder="Repita a senha"
                        invalid={!!errors.confirmPassword}
                        supportText={errors.confirmPassword?.message}
                      />
                    )}
                  />
                </div>

                <Button
                  type="submit"
                  label="Criar conta"
                  className="w-full"
                  loading={isLoading}
                />

                <Typography
                  variant="div"
                  textAlign="center"
                  className="w-full"
                >
                  {'Já tem uma conta? '}
                  <TextLink onClick={() => router.push('/login')}>
                    Fazer login
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

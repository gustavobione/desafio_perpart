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

import { login } from '@/lib/api/auth.api';
import { useAuthStore } from '@/store/auth.store';
import { loginSchema, type LoginFormData } from '@/infrastructure/validations/login';

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setApiError(null);

    try {
      const response = await login({ email: data.email, password: data.password });
      setAuth(response.access_token, response.user);
      router.push('/dashboard');
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        setApiError('E-mail ou senha inválidos. Tente novamente.');
      } else {
        setApiError('Erro ao conectar com o servidor. Tente novamente mais tarde.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 md:p-12 max-w-md">
      <Card title="🎲 Ludoboard — Aluguel de Jogos">
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FlexContainer direction="col" gap="4" justify="center" align="start">
            <div className="w-full">
              <Controller
                name="email"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <InputText
                    {...field}
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
                defaultValue=""
                render={({ field }) => (
                  <InputPassword
                    {...field}
                    label="Senha"
                    placeholder="Digite sua senha"
                    invalid={!!errors.password}
                    supportText={errors.password?.message}
                  />
                )}
              />
            </div>

            {/* Erro da API */}
            {apiError && (
              <Typography variant="div" size="small" className="text-red-600 w-full">
                {apiError}
              </Typography>
            )}

            <Button
              type="submit"
              label="Entrar"
              className="w-full"
              loading={isLoading}
            />

            <Typography variant="div" textAlign="center" className="w-full flex-1">
              {'Não tem uma conta? '}
              <TextLink onClick={() => router.push('/register')}>Cadastre-se</TextLink>
            </Typography>
          </FlexContainer>
        </form>
      </Card>
    </div>
  );
}
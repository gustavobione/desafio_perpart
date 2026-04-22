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
import { registerSchema, type RegisterFormData } from '@/infrastructure/validations/register';

export default function RegisterPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
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
      router.push('/dashboard');
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
    <div className="p-8 md:p-12 max-w-md">
      <Card title="🎲 Criar conta — Ludoboard">
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FlexContainer direction="col" gap="4" justify="center" align="start">
            <div className="w-full">
              <Controller
                name="name"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <InputText
                    {...field}
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
                defaultValue=""
                render={({ field }) => (
                  <InputPassword
                    {...field}
                    label="Confirmar senha"
                    placeholder="Repita a senha"
                    invalid={!!errors.confirmPassword}
                    supportText={errors.confirmPassword?.message}
                  />
                )}
              />
            </div>

            {apiError && (
              <Typography variant="div" size="small" className="text-red-600 w-full">
                {apiError}
              </Typography>
            )}

            <Button
              type="submit"
              label="Criar conta"
              className="w-full"
              loading={isLoading}
            />

            <Typography variant="div" textAlign="center" className="w-full flex-1">
              {'Já tem uma conta? '}
              <TextLink onClick={() => router.push('/login')}>Fazer login</TextLink>
            </Typography>
          </FlexContainer>
        </form>
      </Card>
    </div>
  );
}

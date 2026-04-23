'use client';

import { useState, useEffect, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  InputText,
  InputFile,
  Button,
  Toast,
  MultiSelect,
  MultiSelectChangeEvent,
  FlexContainer,
  InputCurrency,
  Icon,
  InputTextarea,
} from "@uigovpe/components";
import { productsApi } from "@/lib/api/products.api";
import { categoriesApi } from "@/lib/api/categories.api";
import { uploadApi } from "@/lib/api/upload.api";
import { productSchema } from "@/infrastructure/validations/product";
import { z } from "zod";
import { useToast } from "@/hooks/useToast";
import { Category } from "@/types";

const ErrorMessage = ({ message }: { message?: string }) => {
  if (!message) return null;
  return <small className="text-red-500 text-xs mt-1 block">{message}</small>;
};

export default function NewProductPage() {
  const router = useRouter();
  const { toast, showSuccess, showError } = useToast();

  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    pricePerDay: number | undefined;
    categoryIds: string[];
  }>({
    title: '',
    description: '',
    pricePerDay: undefined,
    categoryIds: []
  });
  const [file, setFile] = useState<File | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoriesApi.findAll({ limit: 100 });
        setCategories(res.data);
      } catch (error) {
        console.error("Erro ao carregar categorias", error);
      }
    };
    fetchCategories();
  }, []);

  const validateForm = () => {
    try {
      productSchema.parse({
        ...formData,
        pricePerDay: formData.pricePerDay || undefined,
        categoryIds: formData.categoryIds
      });
      const newErrors: Record<string, string> = {};

      if (file) {
        if (!file.type.startsWith('image/')) {
          newErrors.imageUrl = "O arquivo deve ser uma imagem.";
        }
        if (file.size > 5 * 1024 * 1024) {
          newErrors.imageUrl = "O arquivo deve ter no máximo 5MB.";
        }
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        err.issues.forEach((error) => {
          if (error.path[0]) {
            fieldErrors[error.path[0] as string] = error.message;
          }
        });
        setErrors(fieldErrors);
      }
      return false;
    }
  };

  const handleRegister = async () => {
    if (!validateForm()) return;
    setLoading(true);

    try {
      // 1. Cria o produto (sem imagem)
      const createdProduct = await productsApi.create({
        title: formData.title,
        description: formData.description || undefined,
        pricePerDay: formData.pricePerDay as number,
        categoryIds: formData.categoryIds.length > 0 ? formData.categoryIds : undefined,
        // Nota: status não é enviado — o backend define AVAILABLE por padrão ao criar
      });

      // 2. Se houver imagem, faz upload separado
      if (file) {
        try {
          await uploadApi.uploadProductImage(createdProduct.id, file);
        } catch (uploadError) {
          console.error("Erro no upload da imagem:", uploadError);
          // Produto foi criado, mas upload falhou — avisar sem bloquear
          showError("Aviso", "Jogo cadastrado, mas houve um erro ao enviar a imagem.", 5000);
          router.push('/products');
          return;
        }
      }

      showSuccess("Sucesso!", "Jogo cadastrado com sucesso.", 3000);
      router.push('/products');
    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : "Não foi possível cadastrar o jogo.";
      showError("Erro", errorMessage, 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <FlexContainer direction="col" gap="6" className="w-full animate-fade-in p-4 lg:p-8">
      <Toast ref={toast} />

      {/* Cabeçalho */}
      <div>
        <h1 className="text-4xl font-bold text-[#0034B7] mb-2">
          Cadastrar Jogo
        </h1>
        <p className="text-gray-600">
          Adicione um novo jogo de tabuleiro ao seu acervo.
        </p>
      </div>

      <Card className="bg-white border border-gray-200 shadow-lg" elevation="high">
        <h2 className="text-xl font-bold text-gray-800 mb-6">
          Dados do Jogo
        </h2>

        <FlexContainer direction="col" gap="4" className="w-full">
          {/* Título */}
          <div>
            <InputText
              label="Título*"
              placeholder="Ex: Catan"
              value={formData.title}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                setFormData({ ...formData, title: e.target.value });
                if (errors.title) setErrors({ ...errors, title: '' });
              }}
              invalid={!!errors.title}
              supportText={errors.title}
              className="w-full"
            />
          </div>

          {/* Descrição */}
          <div>
            <InputTextarea
              label="Descrição"
              placeholder="Descrição do jogo e regras básicas..."
              rows={5}
              value={formData.description}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
                setFormData({ ...formData, description: e.target.value });
                if (errors.description) setErrors({ ...errors, description: '' });
              }}
              invalid={!!errors.description}
              supportText={errors.description}
              className="w-full"
            />
          </div>

          {/* Preço e Categoria */}
          <FlexContainer direction="row" gap="4" className="w-full flex-wrap md:flex-nowrap">
            <div className="w-full md:w-1/2">
              <InputCurrency
                label="Preço por Dia (R$)*"
                value={formData.pricePerDay || 0}
                onChange={(e: { value: number }) => {
                  setFormData({ ...formData, pricePerDay: e.value });
                  if (errors.pricePerDay) setErrors({ ...errors, pricePerDay: '' });
                }}
                currency="BRL"
                locale="pt-BR"
                minimumFractionDigits={2}
                maximumFractionDigits={2}
                invalid={!!errors.pricePerDay}
                supportText={errors.pricePerDay}
              />
            </div>

            <div className="w-full md:w-1/2">
              <MultiSelect
                label="Categorias"
                options={categories}
                optionLabel="name"
                optionValue="id"
                value={formData.categoryIds}
                onChange={(e: MultiSelectChangeEvent) => {
                  setFormData({ ...formData, categoryIds: e.value || [] });
                  if (errors.categoryIds) setErrors({ ...errors, categoryIds: '' });
                }}
                placeholder="Selecione as categorias"
                filter
                showClear
                invalid={!!errors.categoryIds}
                supportText={errors.categoryIds || "Opcional"}
                className="w-full"
              />
              <ErrorMessage message={errors.categoryIds} />
            </div>
          </FlexContainer>

          {/* Upload de Imagem */}
          <div className="w-full mt-2">
            <InputFile
              label="Capa do Jogo"
              placeholder="Escolher arquivo"
              accept="image/*"
              supportText="Formatos: JPG, PNG, WEBP. Tamanho máx: 5MB. (Opcional)"
              mode="default"
              onChange={(files) => {
                if (files && files.length > 0) setFile(files[0]);
                else setFile(null);
                if (errors.imageUrl) setErrors({ ...errors, imageUrl: '' });
              }}
              onClear={() => setFile(null)}
              invalid={!!errors.imageUrl}
            />
            <ErrorMessage message={errors.imageUrl} />
          </div>

          {/* Botões */}
          <FlexContainer direction="row" gap="4" className="w-full mt-4 flex-wrap sm:flex-nowrap">
            <Button
              label="Cancelar"
              outlined
              onClick={() => router.back()}
              className="w-full sm:w-1/2"
              disabled={loading}
            />
            <Button
              label={loading ? "Cadastrando..." : "Cadastrar Jogo"}
              icon={<Icon icon="add" outline />}
              onClick={handleRegister}
              loading={loading}
              className="w-full sm:w-1/2"
            />
          </FlexContainer>
        </FlexContainer>
      </Card>
    </FlexContainer>
  );
}

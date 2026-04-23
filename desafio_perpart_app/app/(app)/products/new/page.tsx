'use client';

import { useState, useEffect, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  InputText,
  InputFile,
  Button,
  Toast,
  Dropdown,
  FlexContainer
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

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    pricePerDay: '',
    categoryId: ''
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
        categoryIds: formData.categoryId ? [formData.categoryId] : []
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
      let imageUrl = null;
      if (file) {
        const uploadRes = await uploadApi.uploadFile(file);
        imageUrl = uploadRes.path;
      }

      await productsApi.create({
        title: formData.title,
        description: formData.description,
        pricePerDay: parseFloat(formData.pricePerDay),
        imageUrl: imageUrl,
        categoryIds: [formData.categoryId],
        status: 'AVAILABLE'
      });

      showSuccess("Sucesso!", "Produto cadastrado com sucesso.", 3000);
      router.push('/products');
    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : "Não foi possível cadastrar o produto.";
      showError("Erro", errorMessage, 5000);
    } finally {
      setLoading(false);
    }
  };



  return (
    <FlexContainer direction="col" gap="6" className="w-full animate-fade-in p-4 lg:p-8">
      <Toast ref={toast} />

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
              className="w-full"
            />
            <ErrorMessage message={errors.title} />
          </div>

          <div>
            <InputText
              label="Descrição"
              placeholder="Descrição do jogo e regras básicas..."
              value={formData.description}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                setFormData({ ...formData, description: e.target.value });
                if (errors.description) setErrors({ ...errors, description: '' });
              }}
              invalid={!!errors.description}
              className="w-full"
            />
            <ErrorMessage message={errors.description} />
          </div>

          <FlexContainer direction="row" gap="4" className="w-full mt-6">
            <div>
              <InputText
                label="Preço por Dia (R$)*"
                placeholder="Ex: 15.50"
                value={formData.pricePerDay}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  setFormData({ ...formData, pricePerDay: e.target.value });
                  if (errors.pricePerDay) setErrors({ ...errors, pricePerDay: '' });
                }}
                invalid={!!errors.pricePerDay}
                className="w-full"
              />
              <ErrorMessage message={errors.pricePerDay} />
            </div>

            <div>
              <Dropdown
                label="Categoria*"
                options={categories}
                optionLabel="name"
                optionValue="id"
                value={formData.categoryId}
                onChange={(e) => {
                  setFormData({ ...formData, categoryId: e.value });
                  if (errors.categoryIds) setErrors({ ...errors, categoryIds: '' });
                }}
                placeholder="Selecione a categoria"
                className={`w-full ${errors.categoryIds ? 'p-invalid' : ''}`}
              />
              <ErrorMessage message={errors.categoryIds} />
            </div>
          </FlexContainer>

          <FlexContainer direction="col" gap="4" className="w-full mt-6">
            <InputFile
              label="Capa do Jogo (Opcional)"
              placeholder="Escolher arquivo"
              accept="image/*"
              supportText="Formatos: JPG, PNG. Tamanho máx: 5MB"
              onChange={(files) => {
                if (files && files.length > 0) setFile(files[0]);
                else setFile(null);
                if (errors.imageUrl) setErrors({ ...errors, imageUrl: '' });
              }}
              onClear={() => setFile(null)}
              invalid={!!errors.imageUrl}
            />
            <ErrorMessage message={errors.imageUrl} />
          </FlexContainer>

          <FlexContainer direction="row" gap="4" className="w-full mt-6 flex-wrap sm:flex-nowrap">
            <Button
              label="Cancelar"
              onClick={() => router.back()}
              className="w-full sm:w-1/2 justify-center p-button-outlined"
              disabled={loading}
            />
            <Button
              label={loading ? "Cadastrando..." : "Cadastrar"}
              onClick={handleRegister}
              loading={loading}
              className="w-full sm:w-1/2 justify-center bg-[#0034B7] text-white border-none"
            />
          </FlexContainer>
        </FlexContainer>
      </Card>   
    </FlexContainer>
  );
}

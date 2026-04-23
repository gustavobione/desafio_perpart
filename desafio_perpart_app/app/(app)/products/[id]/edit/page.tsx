'use client';

import { useState, useEffect, ChangeEvent } from "react";
import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
import {
  Card,
  InputText,
  InputFile,
  Button,
  Toast,
  MultiSelect,
  MultiSelectChangeEvent,
  FlexContainer,
  InputCurrency
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

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
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
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        const [product, categoriesRes] = await Promise.all([
          productsApi.findOne(id),
          categoriesApi.findAll({ limit: 100 })
        ]);

        setCategories(categoriesRes.data);

        setFormData({
          title: product.title,
          description: product.description || '',
          pricePerDay: product.pricePerDay,
          categoryIds: product.categories ? product.categories.map((c: Category) => c.id) : []
        });

        if (product.imageUrl) {
          setExistingImageUrl(uploadApi.getImageUrl(product.imageUrl));
        }

      } catch (error) {
        console.error("Erro ao carregar produto", error);
        showError("Erro", "Erro ao carregar dados para edição.", 5000);
        router.push('/products');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, router, showError]);

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

  const handleUpdate = async () => {
    if (!validateForm()) return;
    setSaving(true);

    try {
      await productsApi.update(id, {
        title: formData.title,
        description: formData.description,
        pricePerDay: formData.pricePerDay as number,
        categoryIds: formData.categoryIds
      });

      if (file) {
        await uploadApi.uploadProductImage(id, file);
      }

      showSuccess("Sucesso!", "Produto atualizado com sucesso.", 3000);
      router.push('/products');
    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : "Não foi possível atualizar o produto.";
      showError("Erro", errorMessage, 5000);
    } finally {
      setSaving(false);
    }
  };



  if (loading) {
    return <div className="p-8 text-center text-gray-500">Carregando dados...</div>;
  }

  return (
    <FlexContainer direction="col" gap="6" className="w-full animate-fade-in p-4 lg:p-8">
      <Toast ref={toast} />

      <div>
        <h1 className="text-4xl font-bold text-[#0034B7] mb-2">
          Editar Jogo
        </h1>
      </div>

      <Card className="bg-white border border-gray-200 shadow-lg" elevation="high">
        <h2 className="text-xl font-bold text-gray-800 mb-6">
          Dados do Jogo
        </h2>

        <FlexContainer direction="col" gap="4" className="w-full">
          <div>
            <InputText
              label="Título*"
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
              <InputCurrency
                label="Preço por Dia (R$)*"
                value={formData.pricePerDay || 0}
                onChange={(e: { value: number }) => {
                  setFormData({ ...formData, pricePerDay: e.value });
                  if (errors.pricePerDay) setErrors({ ...errors, pricePerDay: '' });
                }}
                currency="BRL"
                locale="pt-BR"
                invalid={!!errors.pricePerDay}
              />
              <ErrorMessage message={errors.pricePerDay} />
            </div>

            <div>
              <MultiSelect
                label="Categoria*"
                options={categories}
                optionLabel="name"
                optionValue="id"
                value={formData.categoryIds}
                onChange={(e: MultiSelectChangeEvent) => {
                  setFormData({ ...formData, categoryIds: e.value });
                  if (errors.categoryIds) setErrors({ ...errors, categoryIds: '' });
                }}
                placeholder="Selecione as categorias"
                filter
                showClear
                className={`w-full ${errors.categoryIds ? 'p-invalid' : ''}`}
              />
              <ErrorMessage message={errors.categoryIds} />
            </div>
          </FlexContainer>

          <FlexContainer direction="col" gap="4" className="w-full mt-6">
            {existingImageUrl && !file && (
              <div className="mb-2">
                <span className="text-sm text-gray-500 block mb-1">Imagem Atual:</span>
                <div className="relative h-24 w-24 overflow-hidden border rounded">
                  <Image src={existingImageUrl} alt="Imagem Atual" fill className="object-cover" unoptimized />
                </div>
              </div>
            )}
            <InputFile
              label="Capa do Jogo (Opcional)"
              placeholder="Escolher novo arquivo"
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
              disabled={saving}
            />
            <Button
              label={saving ? "Atualizando..." : "Atualizar"}
              onClick={handleUpdate}
              loading={saving}
              className="w-full sm:w-1/2 justify-center bg-[#0034B7] text-white border-none"
            />
          </FlexContainer>
        </FlexContainer>
      </Card>
    </FlexContainer>
  );
}

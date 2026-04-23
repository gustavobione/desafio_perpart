'use client';

import { useState, useEffect, ChangeEvent } from "react";
import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
import {
  Card,
  Button,
  Icon,
  Tag,
  Dialog,
  Toast,
  InputText,
  FlexContainer,
} from "@uigovpe/components";
import { productsApi } from "@/lib/api/products.api";
import { loansApi } from "@/lib/api/loans.api";
import { uploadApi } from "@/lib/api/upload.api";
import { useAuthStore } from "@/store/auth.store";
import { useToast } from "@/hooks/useToast";
import { Product } from "@/types";

export default function ProductDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { toast, showSuccess, showError } = useToast();
  const { user } = useAuthStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [isLoanModalOpen, setIsLoanModalOpen] = useState(false);
  const [expectedReturnDate, setExpectedReturnDate] = useState("");
  const [isRequestingLoan, setIsRequestingLoan] = useState(false);

  const [isFavorite, setIsFavorite] = useState(false);
  const [isFavoriting, setIsFavoriting] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      try {
        const data = await productsApi.findOne(id);
        setProduct(data);
        
        // Verifica se é favorito buscando na lista de favoritos
        const favs = await productsApi.getFavorites({ limit: 100 });
        if (favs.data.some((p) => p.id === id)) {
          setIsFavorite(true);
        }
      } catch (error) {
        console.error("Erro ao carregar o produto", error);
        router.push('/products');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, router]);

  const handleToggleFavorite = async () => {
    if (!product) return;
    setIsFavoriting(true);
    try {
      if (isFavorite) {
        await productsApi.unfavorite(product.id);
        setIsFavorite(false);
        showSuccess("Removido", "Produto removido dos favoritos.");
      } else {
        await productsApi.favorite(product.id);
        setIsFavorite(true);
        showSuccess("Adicionado", "Produto adicionado aos favoritos.");
      }
    } catch {
      showError("Erro", "Não foi possível atualizar os favoritos.");
    } finally {
      setIsFavoriting(false);
    }
  };

  const handleRequestLoan = async () => {
    if (!product || !expectedReturnDate) {
      showError("Erro", "Por favor, informe a data de devolução.");
      return;
    }
    
    setIsRequestingLoan(true);
    try {
      await loansApi.create({
        productId: product.id,
        expectedReturnDate: new Date(expectedReturnDate).toISOString()
      });
      showSuccess("Sucesso!", "Solicitação de empréstimo enviada ao dono.");
      setIsLoanModalOpen(false);
      // Atualizar status do produto para mostrar que foi solicitado (opcional)
      setProduct({ ...product, status: 'RENTED' }); // Optimistic UI
    } catch (error: unknown) {
      console.error(error);
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || "Não foi possível solicitar o empréstimo.";
      showError("Erro", errorMessage);
    } finally {
      setIsRequestingLoan(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Carregando detalhes...</div>;
  }

  if (!product) return null;

  const isOwner = user?.id === product.ownerId;
  const isAdmin = user?.role === 'ADMIN';
  const canEdit = isOwner || isAdmin;
  const isAvailable = product.status === 'AVAILABLE';

  const statusMap: Record<string, { label: string; severity: 'success' | 'warning' | 'danger' }> = {
    AVAILABLE: { label: 'Disponível', severity: 'success' },
    RENTED: { label: 'Alugado / Solicitado', severity: 'warning' },
    MAINTENANCE: { label: 'Manutenção', severity: 'danger' }
  };
  const currentStatus = statusMap[product.status];

  return (
    <FlexContainer direction="col" gap="6" className="w-full animate-fade-in p-4 lg:p-8">
      <Toast ref={toast} />

      <div>
        <h1 className="text-4xl font-bold text-[#0034B7]">
          Detalhes do Jogo
        </h1>
      </div>

      <Card className="bg-white border border-gray-200 shadow-lg" elevation="high">
        <div className="flex flex-col md:flex-row gap-8">
          
          <div className="w-full md:w-1/3 flex justify-center items-start">
            <div className="w-full max-w-sm aspect-square bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center overflow-hidden relative">
              {product.imageUrl ? (
                <Image src={uploadApi.getImageUrl(product.imageUrl)} alt={product.title} fill className="object-cover" unoptimized />
              ) : (
                <Icon icon="image" className="text-6xl text-gray-400" />
              )}
            </div>
          </div>

          <FlexContainer direction="col" gap="6" className="w-full md:w-2/3">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">{product.title}</h2>
                <div className="flex items-center gap-2 mb-4">
                  <Tag value={currentStatus.label} severity={currentStatus.severity} />
                  <span className="text-xl font-semibold text-green-600">
                    R$ {product.pricePerDay.toFixed(2).replace('.', ',')} / dia
                  </span>
                </div>
              </div>
              
              <Button 
                icon={<Icon icon="favorite" outline={!isFavorite} />} 
                className={`p-button-rounded ${isFavorite ? 'text-red-500' : 'text-gray-400'}`} 
                onClick={handleToggleFavorite}
                loading={isFavoriting}
                tooltip={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
              />
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-1">Descrição</h3>
              <p className="text-gray-600">
                {product.description || "Nenhuma descrição informada."}
              </p>
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-1">Categorias</h3>
              <div className="flex flex-wrap gap-2">
                {product.categories && product.categories.length > 0 ? (
                  product.categories.map(cat => (
                    <Tag key={cat.id} value={cat.name} className="bg-blue-100 text-blue-800" />
                  ))
                ) : (
                  <span className="text-gray-500">Nenhuma categoria vinculada.</span>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-1">Dono do Jogo</h3>
              <p className="text-gray-600">
                {product.owner?.name || "Desconhecido"}
              </p>
            </div>

            <FlexContainer direction="row" gap="4" className="w-full pt-6 border-t border-gray-100 flex-wrap sm:flex-nowrap">
              {canEdit && (
                <Button
                  label="Editar Jogo"
                  icon={<Icon icon="edit" outline />}
                  outlined
                  onClick={() => router.push(`/products/${product.id}/edit`)}
                />
              )}

              {!isOwner && isAvailable && (
                <Button
                  label="Pedir Empréstimo"
                  icon={<Icon icon="handshake" outline />}
                  onClick={() => setIsLoanModalOpen(true)}
                />
              )}
            </FlexContainer>
          </FlexContainer>
        </div>
      </Card>

      <Dialog
        header="Solicitar Empréstimo"
        icon={<Icon icon="handshake" outline />}
        visible={isLoanModalOpen}
        onHide={() => setIsLoanModalOpen(false)}
        modal
      >
        <FlexContainer direction="col" gap="4" className="pt-2">
          <p className="text-gray-600 m-0">
            Você está solicitando o jogo <strong>{product.title}</strong>.
            Por favor, informe a data prevista para devolução.
          </p>

          <InputText
            label="Data de Devolução*"
            type="date"
            value={expectedReturnDate}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setExpectedReturnDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="w-full"
          />

          <FlexContainer direction="row" gap="2" className="justify-end mt-4">
            <Button
              label="Cancelar"
              outlined
              onClick={() => setIsLoanModalOpen(false)}
            />
            <Button
              label={isRequestingLoan ? "Enviando..." : "Confirmar Solicitação"}
              onClick={handleRequestLoan}
              loading={isRequestingLoan}
            />
          </FlexContainer>
        </FlexContainer>
      </Dialog>
    </FlexContainer>
  );
}

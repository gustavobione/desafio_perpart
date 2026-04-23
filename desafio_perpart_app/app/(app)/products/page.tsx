'use client';

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  Column,
  Button,
  Icon,
  Card,
  Search,
  Menu,
  Tag,
  Dialog,
  Toast,
  DataTableStateEvent,
  Dropdown,
  MenuRef,
  FlexContainer,
  MultiSelect,
  MultiSelectChangeEvent
} from "@uigovpe/components";
import { productsApi } from "@/lib/api/products.api";
import { categoriesApi } from "@/lib/api/categories.api";
import { useToast } from "@/hooks/useToast";
import { useAuthStore } from "@/store/auth.store";
import { Product, Category } from "@/types";

const ROWS_PER_PAGE_OPTIONS = [5, 10, 20];

export default function ProductsPage() {
  const router = useRouter();
  const { toast, showSuccess, showError } = useToast();
  const { user } = useAuthStore();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);

  // Paginação e Filtros
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(ROWS_PER_PAGE_OPTIONS[0]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const menuRef = useRef<MenuRef>(null);
  const [selectedRow, setSelectedRow] = useState<Product | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const statusOptions = [
    { label: 'Todos', value: null },
    { label: 'Disponível', value: 'AVAILABLE' },
    { label: 'Alugado', value: 'RENTED' },
    { label: 'Em Manutenção', value: 'MAINTENANCE' },
  ];

  // Carregar Categorias
  const loadCategories = useCallback(async () => {
    try {
      const res = await categoriesApi.findAll({ limit: 100 });
      setCategories(res.data);
    } catch (error) {
      console.error("Erro ao buscar categorias", error);
    }
  }, []);

  // Carregar Dados da Tabela
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const pageIndex = Math.floor(first / rows) + 1;
      const res = await productsApi.findAll({
        page: pageIndex,
        limit: rows,
        search: globalFilter || undefined,
        status: selectedStatus || undefined,
        categoryId: selectedCategories.length > 0 ? selectedCategories.join(',') : undefined,
      });
      setProducts(res.data);
      setTotalRecords(res.meta.total);
    } catch (error) {
      console.error("Erro ao buscar produtos", error);
    } finally {
      setLoading(false);
    }
  }, [first, rows, globalFilter, selectedStatus, selectedCategories]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadCategories();
    }, 0);
    return () => clearTimeout(timeoutId);
  }, [loadCategories]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadData();
    }, 0);
    return () => clearTimeout(timeoutId);
  }, [loadData]);

  const onPage = (e: DataTableStateEvent) => {
    setFirst(e.first ?? 0);
    setRows(e.rows ?? rows);
  };

  const handleDelete = async () => {
    if (!selectedRow) return;
    setIsDeleting(true);
    try {
      await productsApi.remove(selectedRow.id);
      showSuccess("Sucesso!", `Produto excluído com sucesso!`, 3000);
      setIsDeleteModalOpen(false);
      loadData();
    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : "Não foi possível excluir.";
      showError("Erro", errorMessage, 5000);
    } finally {
      setIsDeleting(false);
    }
  };

  const isOwnerOrAdmin = (product: Product | null) => {
    if (!product || !user) return false;
    return user.role === 'ADMIN' || product.ownerId === user.id;
  };

  const actionMenuItems = [
    {
      label: 'Detalhes',
      icon: <Icon icon="visibility" />,
      command: () => {
        if (selectedRow) router.push(`/products/${selectedRow.id}`);
      }
    },
    {
      label: 'Editar',
      icon: <Icon icon="edit" />,
      disabled: !isOwnerOrAdmin(selectedRow),
      className: !isOwnerOrAdmin(selectedRow) ? 'opacity-50 cursor-not-allowed pointer-events-none' : '',
      command: () => {
        if (selectedRow) router.push(`/products/${selectedRow.id}/edit`);
      }
    },
    {
      label: 'Excluir',
      icon: <Icon icon="delete" />,
      disabled: !isOwnerOrAdmin(selectedRow),
      className: !isOwnerOrAdmin(selectedRow) ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'text-red-600',
      command: () => {
        if (selectedRow) setIsDeleteModalOpen(true);
      }
    }
  ];

  const statusBodyTemplate = (rowData: Product) => {
    const statusMap: Record<string, { label: string; severity: 'success' | 'warning' | 'danger' }> = {
      AVAILABLE: { label: 'Disponível', severity: 'success' },
      RENTED: { label: 'Alugado', severity: 'warning' },
      MAINTENANCE: { label: 'Manutenção', severity: 'danger' }
    };
    const mapped = statusMap[rowData.status];
    return <Tag value={mapped.label} severity={mapped.severity} className="px-3" />;
  };

  const priceBodyTemplate = (rowData: Product) => {
    return `R$ ${rowData.pricePerDay.toFixed(2).replace('.', ',')}`;
  };

  const actionBodyTemplate = (rowData: Product) => {
    return (
      <div className="flex justify-center">
        <Button
          icon={<Icon icon="more_vert" />}
          className="p-button-rounded p-button-text text-gray-600 hover:bg-gray-100"
          onClick={(event) => {
            setSelectedRow(rowData);
            menuRef.current?.toggle(event);
          }}
          aria-controls="popup_menu"
          aria-haspopup
        />
      </div>
    );
  };

  return (
    <FlexContainer direction="col" gap="6" className="w-full animate-fade-in p-4 lg:p-8">
      <Toast ref={toast} />

      <div>
        <h1 className="text-4xl font-bold text-[#0034B7] mb-2 transition-colors">
          Jogos de Tabuleiro
        </h1>
        <p className="text-gray-600">
          Gerencie e explore o acervo de jogos disponíveis na plataforma.
        </p>
      </div>

      <Card className="bg-white border border-gray-200 shadow-lg" elevation="high">
        <div className="flex flex-col lg:flex-row justify-between items-end gap-4 mb-6">
          <div className="flex flex-col md:flex-row items-end gap-4 w-full lg:w-3/4">
            <div className="w-full lg:w-1/2 max-w-sm">
              <Search
                label="Busque por título"
                placeholder="Digite para filtrar..."
                value={globalFilter}
                onChange={(e: { value: string }) => setGlobalFilter(e.value)}
                showAutocomplete={false}
                className="w-full"
              />
            </div>

            <div className="w-full md:w-40 lg:w-48">
              <Dropdown
                options={statusOptions}
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.value)}
                placeholder="Status"
                className="w-full"
              />
            </div>
            
            <div className="w-full md:w-40 lg:w-48">
              <MultiSelect
                options={categories}
                optionLabel="name"
                optionValue="id"
                value={selectedCategories}
                onChange={(e: MultiSelectChangeEvent) => setSelectedCategories(e.value || [])}
                placeholder="Categorias"
                filter
                showClear
                className="w-full"
              />
            </div>
          </div>

          <div className="w-full lg:w-auto mt-4 lg:mt-0 flex justify-end">
            <Button
              label="Novo Jogo"
              icon={<Icon icon="add" />}
              onClick={() => router.push('/products/new')}
              className="w-full md:w-auto bg-[#0034B7] text-white border-none hover:bg-[#002493]"
            />
          </div>
        </div>

        <Table
          value={products}
          paginator
          first={first}
          rows={rows}
          totalRecords={totalRecords}
          onPage={onPage}
          lazy
          rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
          loading={loading}
          emptyMessage="Nenhum jogo encontrado."
          dataKey="id"
          className="w-full"
        >
          <Column field="title" header="Título" />
          <Column field="pricePerDay" header="Preço / Dia" body={priceBodyTemplate} />
          <Column field="status" header="Status" body={statusBodyTemplate} />
          <Column header="Ação" body={actionBodyTemplate} align="center" style={{ width: '10%' }} />
        </Table>

        <Menu model={actionMenuItems} popup ref={menuRef} id="popup_menu" />
      </Card>

      <Dialog
        header="Excluir Jogo"
        visible={isDeleteModalOpen}
        onHide={() => setIsDeleteModalOpen(false)}
        className="w-[90vw] max-w-md"
      >
        <FlexContainer direction="col" gap="4">
          <p className="text-gray-600">
            Tem certeza que deseja excluir o jogo &quot;{selectedRow?.title}&quot;? Esta ação não pode ser desfeita.
          </p>
          <FlexContainer direction="row" gap="2" className="justify-end mt-4">
            <Button label="Cancelar" className="p-button-text" onClick={() => setIsDeleteModalOpen(false)} />
            <Button label={isDeleting ? "Processando..." : "Confirmar"} className="bg-red-600 text-white border-none" onClick={handleDelete} loading={isDeleting} />
          </FlexContainer>
        </FlexContainer>
      </Dialog>
    </FlexContainer>
  );
}

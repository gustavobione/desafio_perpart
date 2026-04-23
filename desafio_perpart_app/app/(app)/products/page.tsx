"use client";

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
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
  MenuRef,
  FlexContainer,
  Filter,
  FilterOption,
  Chip,
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

  // Paginação
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(ROWS_PER_PAGE_OPTIONS[0]);

  // Ordenação
  const [sortField, setSortField] = useState<string | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<1 | -1 | 0>(0);

  // Filtros
  const [globalFilter, setGlobalFilter] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<FilterOption[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Menu de ações
  const menuRef = useRef<MenuRef>(null);
  const [selectedRow, setSelectedRow] = useState<Product | null>(null);

  // Dialog de exclusão
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Opções de status para o Filter (checkbox)
  const statusFilterOptions = useMemo<FilterOption[]>(
    () => [
      { label: "Disponível", value: "AVAILABLE" },
      { label: "Alugado", value: "RENTED" },
      { label: "Em Manutenção", value: "MAINTENANCE" },
    ],
    [],
  );

  // Carregar Categorias — função declarada dentro do useEffect (padrão React recomendado)
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoriesApi.findAll({ limit: 100 });
        setCategories(res.data);
      } catch (error) {
        console.error("Erro ao buscar categorias", error);
      }
    };
    fetchCategories();
  }, []); // [] = executa apenas uma vez ao montar

  // Carregar Dados da Tabela com debounce de 300ms para evitar excesso de requisições
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const pageIndex = Math.floor(first / rows) + 1;
      const statusValues = selectedStatus.map((s) => s.value as string);
      const res = await productsApi.findAll({
        page: pageIndex,
        limit: rows,
        search: globalFilter || undefined,
        status: statusValues.length === 1 ? statusValues[0] : undefined,
        categoryId:
          selectedCategories.length > 0
            ? selectedCategories.join(",")
            : undefined,
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
      loadData();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [loadData]);

  const onPage = (e: DataTableStateEvent) => {
    setFirst(e.first ?? 0);
    setRows(e.rows ?? rows);
  };

  const onSort = (e: DataTableStateEvent) => {
    setSortField(e.sortField as string | undefined);
    setSortOrder((e.sortOrder as 1 | -1 | 0) ?? 0);
    setFirst(0);
  };

  const handleDelete = async () => {
    if (!selectedRow) return;
    setIsDeleting(true);
    try {
      await productsApi.remove(selectedRow.id);
      showSuccess(
        "Sucesso!",
        `Jogo "${selectedRow.title}" excluído com sucesso!`,
        3000,
      );
      setIsDeleteModalOpen(false);
      loadData();
    } catch (error) {
      console.error(error);
      const errorMessage =
        error instanceof Error ? error.message : "Não foi possível excluir.";
      showError("Erro", errorMessage, 5000);
    } finally {
      setIsDeleting(false);
    }
  };

  const isOwnerOrAdmin = (product: Product | null) => {
    if (!product || !user) return false;
    return user.role === "ADMIN" || product.ownerId === user.id;
  };

  const handleActionClick = (event: React.MouseEvent, rowData: Product) => {
    setSelectedRow(rowData);
    menuRef.current?.toggle(event);
  };

  const actionMenuItems = [
    {
      label: "Detalhes",
      icon: <Icon icon="visibility" />,
      command: () => {
        if (selectedRow) router.push(`/products/${selectedRow.id}`);
      },
    },
    {
      label: "Editar",
      icon: <Icon icon="edit" />,
      disabled: !isOwnerOrAdmin(selectedRow),
      command: () => {
        if (selectedRow && isOwnerOrAdmin(selectedRow))
          router.push(`/products/${selectedRow.id}/edit`);
      },
    },
    {
      label: "Excluir",
      icon: <Icon icon="delete" />,
      disabled: !isOwnerOrAdmin(selectedRow),
      command: () => {
        if (selectedRow && isOwnerOrAdmin(selectedRow))
          setIsDeleteModalOpen(true);
      },
    },
  ];

  const statusBodyTemplate = (rowData: Product) => {
    const statusMap: Record<
      string,
      { label: string; severity: "success" | "warning" | "danger" }
    > = {
      AVAILABLE: { label: "Disponível", severity: "success" },
      RENTED: { label: "Alugado", severity: "warning" },
      MAINTENANCE: { label: "Manutenção", severity: "danger" },
    };
    const mapped = statusMap[rowData.status];
    return (
      <Tag
        value={mapped?.label ?? rowData.status}
        severity={mapped?.severity}
      />
    );
  };

  const priceBodyTemplate = (rowData: Product) => {
    return `R$ ${rowData.pricePerDay.toFixed(2).replace(".", ",")}`;
  };

  const actionBodyTemplate = (rowData: Product) => {
    return (
      <Button
        icon={<Icon icon="more_vert" />}
        tooltip="Menu de ações"
        plain
        rounded
        link
        onClick={(event) =>
          handleActionClick(event as React.MouseEvent, rowData)
        }
        aria-controls="popup_menu_products"
        aria-haspopup
      />
    );
  };

  const handleRemoveStatusChip = (labelToRemove: string) => () => {
    setSelectedStatus((prev) => prev.filter((s) => s.label !== labelToRemove));
    return true;
  };

  const categoryFilterOptions = useMemo<FilterOption[]>(() => {
    return categories.map((cat) => ({
      label: cat.name,
      value: cat.id,
    }));
  }, [categories]);

  // Função para remover uma categoria clicando no "X" do Chip
  const handleRemoveCategoryChip = useCallback(
    (labelToRemove: string) => () => {
      setSelectedCategories((prev) => {
        // Precisamos encontrar qual o ID (value) corresponde a essa label (name)
        const categoryToRemove = categoryFilterOptions.find((c) => c.label === labelToRemove);
        if (!categoryToRemove) return prev;
        // Retorna a lista sem o ID removido
        return prev.filter((id) => id !== categoryToRemove.value);
      });
      return true;
    },
    [categoryFilterOptions]
  );

  return (
    <FlexContainer
      direction="col"
      gap="6"
      className="w-full animate-fade-in p-4 lg:p-8"
    >
      <Toast ref={toast} />

      <div>
        <h1 className="text-4xl font-bold text-[#0034B7] mb-2 transition-colors">
          Jogos de Tabuleiro
        </h1>
        <p className="text-gray-600">
          Gerencie e explore o acervo de jogos disponíveis na plataforma.
        </p>
      </div>

      <Card
        className="bg-white border border-gray-200 shadow-lg"
        elevation="high"
      >
        {/* Barra de filtros */}
        <div className="flex flex-col lg:flex-row justify-between items-end gap-4 mb-6">
          <div className="flex flex-col md:flex-row items-end gap-4 w-full lg:w-auto flex-1">
            {/* Busca por título */}
            <div className="w-full lg:w-64">
              <Search
                label="Buscar jogo"
                placeholder="Digite o título..."
                value={globalFilter}
                onChange={(e: { value: string }) => setGlobalFilter(e.value)}
                showAutocomplete={false}
                className="w-full"
              />
            </div>

            {/* Filtro de Status com Filter + Chip */}
            <div className="flex flex-col gap-2">
              <Filter
                label="Status"
                type="checkbox"
                values={statusFilterOptions}
                value={selectedStatus}
                onChange={setSelectedStatus}
              />
              {selectedStatus.length > 0 && (
                <FlexContainer direction="row" gap="1" className="flex-wrap">
                  {selectedStatus.map((item) => (
                    <Chip
                      key={item.value as string}
                      label={item.label}
                      removable
                      onRemove={handleRemoveStatusChip(item.label)}
                    />
                  ))}
                </FlexContainer>
              )}
            </div>

            {/* Filtro de Categorias */}
            <div className="flex flex-col gap-2 w-full md:w-56">
              <Filter
                label="Categorias"
                type="checkbox"
                values={categoryFilterOptions}
                value={categoryFilterOptions.filter(opt => selectedCategories.includes(opt.value as string))}
                onChange={(newValues: FilterOption[]) => {
                  setSelectedCategories(newValues.map(v => v.value as string));
                }}
              />
              {selectedCategories.length > 0 && (
                <FlexContainer direction="row" gap="2" className="flex-wrap">
                  {selectedCategories.map((categoryId) => {
                    const catLabel = categoryFilterOptions.find(c => c.value === categoryId)?.label || "Desconhecido";
                    return (
                      <Chip
                        key={categoryId}
                        label={catLabel}
                        removable
                        onRemove={handleRemoveCategoryChip(catLabel)}
                      />
                    );
                  })}
                </FlexContainer>
              )}
            </div>
          </div>

          {/* Botão Novo */}
          <div className="w-full lg:w-auto flex justify-end">
            <Button
              label="Novo Jogo"
              icon={<Icon icon="add" />}
              onClick={() => router.push("/products/new")}
            />
          </div>
        </div>

        {/* Tabela */}
        <Table
          value={products}
          paginator
          first={first}
          rows={rows}
          totalRecords={totalRecords}
          onPage={onPage}
          onSort={onSort}
          sortField={sortField}
          sortOrder={sortOrder}
          lazy
          rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
          loading={loading}
          emptyMessage="Nenhum jogo encontrado."
          dataKey="id"
          stripedRows
          tableStyle={{ minWidth: "40rem" }}
        >
          <Column sortable field="title" header="Título" />
          <Column
            sortable
            field="pricePerDay"
            header="Preço / Dia"
            body={priceBodyTemplate}
          />
          <Column
            sortable
            field="status"
            header="Status"
            body={statusBodyTemplate}
          />
          <Column
            header="Ações"
            body={actionBodyTemplate}
            align="center"
            style={{ width: "6rem" }}
          />
        </Table>

        {/* Menu popup de ações */}
        <Menu
          model={actionMenuItems}
          popup
          ref={menuRef}
          popupAlignment="right"
          id="popup_menu_products"
        />
      </Card>

      {/* Dialog de Confirmação de Exclusão */}
      <Dialog
        header="Excluir Jogo"
        icon={<Icon icon="delete" outline />}
        visible={isDeleteModalOpen}
        onHide={() => setIsDeleteModalOpen(false)}
        modal
      >
        <FlexContainer direction="col" gap="4">
          <p className="text-gray-600 m-0">
            Tem certeza que deseja excluir o jogo{" "}
            <strong>&quot;{selectedRow?.title}&quot;</strong>? Esta ação não
            pode ser desfeita.
          </p>
          <FlexContainer direction="row" gap="2" className="justify-end mt-4">
            <Button
              label="Cancelar"
              outlined
              onClick={() => setIsDeleteModalOpen(false)}
            />
            <Button
              label={isDeleting ? "Excluindo..." : "Confirmar Exclusão"}
              severity="danger"
              onClick={handleDelete}
              loading={isDeleting}
            />
          </FlexContainer>
        </FlexContainer>
      </Dialog>
    </FlexContainer>
  );
}

'use client';

import { useEffect, useState, useRef, useCallback, ChangeEvent } from "react";
import {
  Table,
  Column,
  Button,
  Icon,
  Card,
  Search,
  Menu,
  Dialog,
  Toast,
  DataTableStateEvent,
  MenuRef,
  FlexContainer,
  InputText
} from "@uigovpe/components";
import { categoriesApi } from "@/lib/api/categories.api";
import { useToast } from "@/hooks/useToast";
import { useAuthStore } from "@/store/auth.store";
import { Category } from "@/types";
import { categorySchema } from "@/infrastructure/validations/category";
import { z } from "zod";

const ROWS_PER_PAGE_OPTIONS = [5, 10, 20];

export default function CategoriesPage() {
  const { toast, showSuccess, showError } = useToast();
  const { user } = useAuthStore();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);

  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(ROWS_PER_PAGE_OPTIONS[0]);
  const [globalFilter, setGlobalFilter] = useState("");

  const menuRef = useRef<MenuRef>(null);
  const [selectedRow, setSelectedRow] = useState<Category | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({ name: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const pageIndex = Math.floor(first / rows) + 1;
      const res = await categoriesApi.findAll({
        page: pageIndex,
        limit: rows,
        search: globalFilter || undefined,
      });
      setCategories(res.data);
      setTotalRecords(res.meta.total);
    } catch (error) {
      console.error("Erro ao buscar categorias", error);
    } finally {
      setLoading(false);
    }
  }, [first, rows, globalFilter]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadData();
    }, 500); // debounce para o search
    return () => clearTimeout(timeoutId);
  }, [loadData]);

  const onPage = (event: DataTableStateEvent) => {
    setFirst(event.first);
    setRows(event.rows);
  };

  const isAdmin = user?.role === 'ADMIN';

  // Modal handlers
  const openCreateModal = () => {
    setIsEditMode(false);
    setFormData({ name: '' });
    setErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (category: Category) => {
    setIsEditMode(true);
    setFormData({ name: category.name });
    setErrors({});
    setIsModalOpen(true);
  };

  const validateForm = () => {
    try {
      categorySchema.parse(formData);
      setErrors({});
      return true;
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

  const handleSave = async () => {
    if (!validateForm()) return;
    setIsSaving(true);
    try {
      if (isEditMode && selectedRow) {
        await categoriesApi.update(selectedRow.id, formData);
        showSuccess("Sucesso!", "Categoria atualizada.", 3000);
      } else {
        await categoriesApi.create(formData);
        showSuccess("Sucesso!", "Categoria criada.", 3000);
      }
      setIsModalOpen(false);
      loadData();
    } catch (error) {
      console.error(error);
      showError("Erro", "Não foi possível salvar a categoria.", 5000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedRow) return;
    setIsDeleting(true);
    try {
      await categoriesApi.remove(selectedRow.id);
      showSuccess("Sucesso!", `Categoria excluída!`, 3000);
      setIsDeleteModalOpen(false);
      loadData();
    } catch (error) {
      console.error(error);
      showError("Erro", "Não foi possível excluir (pode estar em uso).", 5000);
    } finally {
      setIsDeleting(false);
    }
  };

  const actionMenuItems = [
    {
      label: 'Editar',
      icon: <Icon icon="edit" />,
      disabled: !isAdmin,
      className: !isAdmin ? 'opacity-50 cursor-not-allowed pointer-events-none' : '',
      command: () => {
        if (selectedRow) openEditModal(selectedRow);
      }
    },
    {
      label: 'Excluir',
      icon: <Icon icon="delete" />,
      disabled: !isAdmin,
      className: !isAdmin ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'text-red-600',
      command: () => {
        if (selectedRow) setIsDeleteModalOpen(true);
      }
    }
  ];

  const actionBodyTemplate = (rowData: Category) => {
    return (
      <Button
        icon={<Icon icon="more_vert" />}
        className="p-button-rounded p-button-text text-gray-600"
        onClick={(event) => {
          setSelectedRow(rowData);
          menuRef.current?.toggle(event);
        }}
        aria-controls="popup_menu"
        aria-haspopup
      />
    );
  };

  return (
    <FlexContainer direction="col" gap="6" className="w-full animate-fade-in p-4 lg:p-8">
      <Toast ref={toast} />

      <div>
        <h1 className="text-4xl font-bold text-[#0034B7] mb-2">
          Categorias
        </h1>
        <p className="text-gray-600">
          Gerencie as categorias dos jogos de tabuleiro.
        </p>
      </div>

      <Card className="bg-white border border-gray-200 shadow-lg" elevation="high">
        <div className="flex flex-col lg:flex-row justify-between items-end gap-4 mb-6">
          <div className="w-full lg:w-1/3">
            <Search
              label="Busque por nome"
              placeholder="Digite para filtrar..."
              value={globalFilter}
              onChange={(e: { value: string }) => setGlobalFilter(e.value)}
              showAutocomplete={false}
              className="w-full"
            />
          </div>

          <div className="w-full lg:w-auto mt-4 lg:mt-0 flex justify-end">
            <Button
              label="Nova Categoria"
              icon={<Icon icon="add" />}
              onClick={openCreateModal}
              disabled={!isAdmin}
              className="w-full md:w-auto bg-[#0034B7] text-white border-none hover:bg-[#002493]"
            />
          </div>
        </div>

        <Table
          value={categories}
          paginator
          first={first}
          rows={rows}
          totalRecords={totalRecords}
          onPage={onPage}
          lazy
          rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
          loading={loading}
          emptyMessage="Nenhuma categoria encontrada."
          dataKey="id"
          className="w-full"
        >
          <Column field="name" header="Nome da Categoria" />
          <Column header="Ação" body={actionBodyTemplate} align="center" style={{ width: '10%' }} />
        </Table>

        <Menu model={actionMenuItems} popup ref={menuRef} id="popup_menu" />
      </Card>

      {/* Modal Criar/Editar */}
      <Dialog
        header={isEditMode ? "Editar Categoria" : "Nova Categoria"}
        visible={isModalOpen}
        onHide={() => setIsModalOpen(false)}
        className="w-[90vw] max-w-md"
      >
        <FlexContainer direction="col" gap="4">
          <div>
            <InputText
              label="Nome da Categoria*"
              placeholder="Ex: Estratégia"
              value={formData.name}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                setFormData({ name: e.target.value });
                if (errors.name) setErrors({});
              }}
              invalid={!!errors.name}
              className="w-full"
            />
            {errors.name && (
              <small className="text-red-500 text-xs mt-1 block">{errors.name}</small>
            )}
          </div>
          <FlexContainer direction="row" gap="2" className="justify-end mt-4">
            <Button label="Cancelar" className="p-button-text" onClick={() => setIsModalOpen(false)} />
            <Button 
              label={isSaving ? "Salvando..." : "Salvar"} 
              className="bg-[#0034B7] text-white border-none" 
              onClick={handleSave} 
              loading={isSaving} 
            />
          </FlexContainer>
        </FlexContainer>
      </Dialog>

      {/* Modal Excluir */}
      <Dialog
        header="Excluir Categoria"
        visible={isDeleteModalOpen}
        onHide={() => setIsDeleteModalOpen(false)}
        className="w-[90vw] max-w-md"
      >
        <FlexContainer direction="col" gap="4">
          <p className="text-gray-600">
            Tem certeza que deseja excluir a categoria &quot;{selectedRow?.name}&quot;? Esta ação não pode ser desfeita.
          </p>
          <FlexContainer direction="row" gap="2" className="justify-end mt-4">
            <Button label="Cancelar" className="p-button-text" onClick={() => setIsDeleteModalOpen(false)} />
            <Button 
              label={isDeleting ? "Processando..." : "Confirmar"} 
              className="bg-red-600 text-white border-none" 
              onClick={handleDelete} 
              loading={isDeleting} 
            />
          </FlexContainer>
        </FlexContainer>
      </Dialog>
    </FlexContainer>
  );
}

'use client';

import { useTheme } from '@/context/ThemeContext';
import { useRole } from '@/context/RoleContext';
import { AdminSideBar, type SidebarSectionProps } from '@uigovpe/components';

// ─────────────────────────────────────────────────────────
// Menus por role
// ─────────────────────────────────────────────────────────

const ADMIN_SECTIONS: SidebarSectionProps[] = [
  {
    id: 'visao-geral',
    title: 'Visão Geral',
    icon: 'dashboard',
    items: [
      { id: 'dashboard', label: 'Dashboard', link: '/dashboard' },
    ],
  },
  {
    id: 'catalogo',
    title: 'Catálogo',
    icon: 'inventory',
    items: [
      { id: 'products', label: 'Produtos', link: '/products' },
      { id: 'categories', label: 'Categorias', link: '/categories' },
    ],
  },
  {
    id: 'operacoes',
    title: 'Operações',
    icon: 'handshake',
    items: [
      { id: 'loans', label: 'Empréstimos', link: '/loans' },
      { id: 'notifications', label: 'Notificações', link: '/notifications' },
    ],
  },
  {
    id: 'administracao',
    title: 'Administração',
    icon: 'admin_panel_settings',
    items: [
      { id: 'users', label: 'Usuários', link: '/users' },
      { id: 'audit', label: 'Auditoria', link: '/audit' },
    ],
  },
  {
    id: 'conta',
    title: 'Minha Conta',
    link: '/profile',
  },
];

const USER_SECTIONS: SidebarSectionProps[] = [
  {
    id: 'principal',
    title: 'Início',
    link: '/dashboard',
  },
  {
    id: 'catalogo',
    title: 'Catálogo',
    icon: 'inventory',
    items: [
      { id: 'products', label: 'Produtos', link: '/products' },
    ],
  },
  {
    id: 'minha-conta',
    title: 'Minha Conta',
    icon: 'person',
    items: [
      { id: 'loans', label: 'Meus Empréstimos', link: '/loans' },
      { id: 'notifications', label: 'Notificações', link: '/notifications' },
      { id: 'profile', label: 'Perfil', link: '/profile' },
    ],
  },
];

// ─────────────────────────────────────────────────────────
// Logos
// ─────────────────────────────────────────────────────────
const LOGO_LIGHT = {
  src: '/logos/ludoboard-light.svg',
  alt: 'Ludoboard',
  width: 140,
  height: 50,
};

const LOGO_DARK = {
  src: '/logos/ludoboard-dark.svg',
  alt: 'Ludoboard',
  width: 140,
  height: 50,
};

const FOOTER_LOGO = {
  src: '/logos/logo-pe.svg',
  alt: 'Governo de Pernambuco',
  width: 120,
  height: 40,
};

// ─────────────────────────────────────────────────────────
// Componente
// ─────────────────────────────────────────────────────────
export function AppSidebar() {
  const { isDark } = useTheme();
  const { isAdmin } = useRole();

  const sections = isAdmin ? ADMIN_SECTIONS : USER_SECTIONS;

  return (
    <AdminSideBar
      title="Ludoboard"
      version="1.0.0"
      sections={sections}
      theme="primary"
      logo={isDark ? LOGO_DARK : LOGO_LIGHT}
      footerSidebarLogo={FOOTER_LOGO}
      className="[&_.admin-sidebar-logo-box]:bg-transparent dark:bg-neutral-800 dark:[&_span]:text-yellow-200"
    />
  );
}

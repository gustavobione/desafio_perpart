'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

import {
  LayoutProvider,
  AppLayout,
  AdminUserBar,
  BreadCrumb,
  GovBar,
  Icon,
  type MenuAction,
  type BreadcrumbProps,
} from '@uigovpe/components';

import { useAuthStore } from '@/store/auth.store';
import { RoleProvider } from '@/context/RoleContext';
import { AppSidebar } from '@/components/layout/AppSidebar';

export default function AppLayoutGroup({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setIsMounted(true), 0);
    return () => clearTimeout(timeout);
  }, []);

  if (!isMounted || !user || !isAuthenticated) {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  const userMenuActions: MenuAction = [
    {
      label: 'Perfil',
      icon: <Icon icon="account_circle" />,
      command: () => router.push('/profile'),
    },
    {
      label: 'Sair',
      icon: <Icon icon="logout" />,
      command: handleLogout,
    },
  ];

  const generateBreadcrumbs = () => {
    const paths = pathname.split('/').filter(Boolean);
    
    const routeLabels: Record<string, string> = {
      dashboard: 'Dashboard',
      products: 'Produtos',
      categories: 'Categorias',
      loans: 'Empréstimos',
      notifications: 'Notificações',
      users: 'Usuários',
      audit: 'Auditoria',
      profile: 'Perfil',
    };

    return paths.map((path, index) => {
      const href = `/${paths.slice(0, index + 1).join('/')}`;
      const label = routeLabels[path] ?? path.charAt(0).toUpperCase() + path.slice(1);
      const isLast = index === paths.length - 1;

      return {
        label,
        url: isLast ? undefined : href,
        template: isLast ? (
          <span className="font-medium">{label}</span>
        ) : (
          <Link href={href} className="hover:underline">
            {label}
          </Link>
        ),
      };
    });
  };

  const breadcrumbData: BreadcrumbProps = {
    home: {
      label: 'Home',
      url: '/dashboard',
      template: (
        <Link href="/dashboard" className="flex items-center">
          <Icon icon="home" className="mr-1" />
        </Link>
      ),
    },
    items: generateBreadcrumbs(),
  };

  return (
    <LayoutProvider breakpoint={900} template="backoffice">
      <RoleProvider>
        {/* GovBar dentro do LayoutProvider recebe template='backoffice' e fica position:fixed */}
        <GovBar />
        <AppLayout>
          <AppLayout.MainLayout>
            <AppSidebar />
            <AppLayout.ContentSection>
              <AdminUserBar
                user={{
                  name: user.name,
                  profile: user.role === 'ADMIN' ? 'Administrador' : 'Usuário',
                }}
                menuActions={userMenuActions}
                breadcrumb={breadcrumbData}
                avatarIcon="person"
              />
              <AppLayout.MainContent>
                <AppLayout.BreadCrumbSection>
                  <BreadCrumb home={breadcrumbData.home} model={breadcrumbData.items} />
                </AppLayout.BreadCrumbSection>
                <AppLayout.PageContent className="transition-colors duration-300">
                  {children}
                </AppLayout.PageContent>
              </AppLayout.MainContent>
            </AppLayout.ContentSection>
          </AppLayout.MainLayout>
        </AppLayout>
      </RoleProvider>
    </LayoutProvider>
  );
}

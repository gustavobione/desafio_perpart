'use client';

import { useEffect, useState } from 'react';
import { Card, Icon, Typography } from '@uigovpe/components';
import { useAuthStore } from '@/store/auth.store';
import { useRole } from '@/context/RoleContext';
import { auditApi, AuditReportData } from '@/lib/api/audit.api';
import { loansApi } from '@/lib/api/loans.api';
import { productsApi } from '@/lib/api/products.api';
import { Loan, Product } from '@/types';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { isAdmin } = useRole();

  return (
    <div className="flex flex-col gap-6">
      <section className="mb-2">
        <Typography variant="h1" className="mb-2">
          Bem-vindo(a), {user?.name}!
        </Typography>
        <Typography variant="p">
          Este é o seu painel de controle do Ludoboard.
        </Typography>
      </section>

      {isAdmin ? <AdminDashboard /> : <UserDashboard />}
    </div>
  );
}

function AdminDashboard() {
  const [report, setReport] = useState<AuditReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const data = await auditApi.getReport();
        setReport(data);
      } catch (error) {
        console.error('Erro ao buscar relatório:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, []);

  const kpiList = [
    { title: 'Total de Jogos', value: report?.totalProducts },
    { title: 'Usuários Ativos', value: report?.totalUsers },
    { title: 'Empréstimos Ativos', value: report?.activeLoans },
    { title: 'Atrasos', value: report?.overdueLoans, isError: (report?.overdueLoans ?? 0) > 0 },
  ];

  return (
    <>
      <div className="
          w-full
          flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 mb-2
          md:grid md:grid-cols-2 lg:grid-cols-4 md:overflow-visible md:pb-0 md:mb-6
          scrollbar-thin scrollbar-thumb-gray-300
      ">
        {kpiList.map((item, index) => (
          <div key={index} className="min-w-[80vw] sm:min-w-[45vw] md:min-w-0 snap-center h-full">
            <KpiCard title={item.title} value={item.value} isError={item.isError} loading={loading} />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card
          title={<span className="text-gray-700">Atividades Mais Frequentes</span>}
          elevation="medium"
          className="h-full"
        >
          <div className="py-4">
            {loading ? (
              <div className="text-center text-gray-500">Carregando...</div>
            ) : report?.logsByAction && report.logsByAction.length > 0 ? (
              <ul className="space-y-3">
                {report.logsByAction.slice(0, 5).map((log, idx) => (
                  <li key={idx} className="flex justify-between items-center text-sm border-b pb-2 last:border-0">
                    <span className="font-medium text-gray-700 dark:text-gray-300">{log.action}</span>
                    <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">{log.count} vezes</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center text-gray-500">Nenhuma atividade recente registrada.</div>
            )}
          </div>
        </Card>

        <Card
          title={<span className="text-gray-700">Ações Rápidas</span>}
          elevation="medium"
          className="h-full"
        >
          <div className="py-4 flex flex-col gap-3">
            <Link href="/products/new" className="ui-btn ui-btn-primary w-full justify-center">
              <Icon icon="add" /> Cadastrar Jogo
            </Link>
            <Link href="/users" className="ui-btn ui-btn-outline w-full justify-center">
              <Icon icon="group" /> Gerenciar Usuários
            </Link>
            <Link href="/audit" className="ui-btn ui-btn-outline w-full justify-center">
              <Icon icon="receipt_long" /> Ver Auditoria Completa
            </Link>
          </div>
        </Card>
      </div>
    </>
  );
}

function UserDashboard() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [loansRes, productsRes] = await Promise.all([
          loansApi.findAll({ limit: 5 }), // Traz os últimos empréstimos (locatário ou dono)
          productsApi.findAll({ limit: 5, status: 'AVAILABLE' }) // Jogos disponíveis para recomendação
        ]);
        
        // Filtra para mostrar apenas empréstimos ativos ou solicitados
        const activeLoans = loansRes.data.filter(l => l.status === 'ACTIVE' || l.status === 'REQUESTED' || l.status === 'OVERDUE');
        setLoans(activeLoans);
        setProducts(productsRes.data);
      } catch (error) {
        console.error('Erro ao buscar dados do usuário:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card
        title={<span className="text-gray-700">Meus Empréstimos em Andamento</span>}
        elevation="medium"
        className="h-full"
      >
        <div className="py-4">
          {loading ? (
            <div className="text-center text-gray-500">Carregando...</div>
          ) : loans.length > 0 ? (
            <ul className="space-y-4">
              {loans.map(loan => (
                <li key={loan.id} className="flex flex-col border p-3 rounded shadow-sm bg-gray-50 dark:bg-gray-800">
                  <span className="font-bold">{loan.product?.title}</span>
                  <div className="flex justify-between mt-2 text-sm text-gray-600 dark:text-gray-400">
                    <span>Status: <strong className={loan.status === 'OVERDUE' ? 'text-red-500' : 'text-blue-500'}>{loan.status}</strong></span>
                    <span>Retorno: {new Date(loan.expectedReturnDate).toLocaleDateString()}</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center text-gray-500">Você não possui jogos alugados no momento.</div>
          )}
          
          <div className="mt-4 text-center">
             <Link href="/loans" className="text-blue-600 hover:underline text-sm">Ver todos os empréstimos</Link>
          </div>
        </div>
      </Card>
      
      <Card
        title={<span className="text-gray-700">Recomendações Disponíveis</span>}
        elevation="medium"
        className="h-full"
      >
        <div className="py-4">
          {loading ? (
            <div className="text-center text-gray-500">Carregando...</div>
          ) : products.length > 0 ? (
            <ul className="space-y-3">
              {products.map(product => (
                <li key={product.id} className="flex justify-between items-center border-b pb-2 last:border-0">
                  <span className="font-medium text-gray-700 dark:text-gray-300">{product.title}</span>
                  <Link href={`/products/${product.id}`} className="ui-btn ui-btn-outline ui-btn-sm">
                    Ver Jogo
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center text-gray-500">Nenhum jogo disponível no momento.</div>
          )}
          
          <div className="mt-4 text-center">
             <Link href="/products" className="text-blue-600 hover:underline text-sm">Ver catálogo completo</Link>
          </div>
        </div>
      </Card>
    </div>
  );
}

function KpiCard({ title, value, isError, loading }: { title: string, value?: number | null, isError?: boolean, loading?: boolean }) {
  let content;

  if (loading) {
    content = <span className="text-2xl font-medium animate-pulse text-gray-400">...</span>;
  } else if (isError && value === undefined) {
    content = (
      <div className="flex items-center gap-2 text-red-600 dark:text-red-400 animate-pulse">
        <Icon icon="error" />
        <span className="text-lg font-bold">Erro</span>
      </div>
    );
  } else {
    const displayValue = value ?? 0;
    
    content = (
      <span className={`text-4xl font-extrabold animate-in fade-in duration-500 ${isError ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
        {displayValue}
      </span>
    );
  }

  return (
    <Card
      title={<span className="text-gray-700 dark:text-yellow-200">{title}</span>}
      elevation="low"
      className="h-full flex flex-col justify-between"
    >
      <div className="flex items-center justify-center py-4 min-h-20">
        {content}
      </div>
    </Card>
  );
}

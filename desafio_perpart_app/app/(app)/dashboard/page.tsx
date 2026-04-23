'use client';

import { Card, Icon, Typography } from '@uigovpe/components';
import { useAuthStore } from '@/store/auth.store';
import { useRole } from '@/context/RoleContext';

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
  const kpiList = [
    { title: 'Total de Jogos', value: 124 },
    { title: 'Usuários Ativos', value: 45 },
    { title: 'Empréstimos em Andamento', value: 12 },
    { title: 'Atrasos', value: 2, isError: true },
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
            <KpiCard title={item.title} value={item.value} isError={item.isError} />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card
          title={<span className="text-gray-700">Últimos Empréstimos</span>}
          elevation="medium"
          className="h-full"
        >
          <div className="py-4 text-center text-gray-500">
            Nenhum empréstimo recente.
          </div>
        </Card>

        <Card
          title={<span className="text-gray-700">Atividades Recentes</span>}
          elevation="medium"
          className="h-full"
        >
          <div className="py-4 text-center text-gray-500">
            <div className="mb-3 p-3 bg-gray-50 rounded-full inline-block">
              <Icon icon="history" />
            </div>
            <p className="text-sm">Nenhuma atividade recente registrada.</p>
          </div>
        </Card>
      </div>
    </>
  );
}

function UserDashboard() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card
        title={<span className="text-gray-700">Meus Empréstimos Atuais</span>}
        elevation="medium"
        className="h-full"
      >
        <div className="py-4 text-center text-gray-500">
          Você não possui jogos alugados no momento.
        </div>
      </Card>
      <Card
        title={<span className="text-gray-700">Recomendações</span>}
        elevation="medium"
        className="h-full"
      >
        <div className="py-4 text-center text-gray-500">
          Descubra novos jogos no catálogo!
        </div>
      </Card>
    </div>
  );
}

function KpiCard({ title, value, isError }: { title: string, value?: number | null, isError?: boolean }) {
  let content;

  if (isError && value === undefined) {
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

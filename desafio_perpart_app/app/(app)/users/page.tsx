'use client';

import { Typography } from '@uigovpe/components';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function UsersPage() {
  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <div className="flex flex-col gap-6">
        <Typography variant="h1">Usuários</Typography>
        <Typography variant="p">Em construção...</Typography>
      </div>
    </ProtectedRoute>
  );
}

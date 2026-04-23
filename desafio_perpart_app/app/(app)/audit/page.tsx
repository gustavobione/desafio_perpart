'use client';

import { Typography } from '@uigovpe/components';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function AuditPage() {
  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <div className="flex flex-col gap-6">
        <Typography variant="h1">Auditoria</Typography>
        <Typography variant="p">Em construção...</Typography>
      </div>
    </ProtectedRoute>
  );
}

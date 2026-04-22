import { Role, NotificationType } from '@prisma/client';

/**
 * Payload do JWT após decodificação pelo JwtStrategy.
 * Representa o objeto que fica em req.user após autenticação.
 */
export interface JwtPayload {
  userId: string;
  email: string;
  role: Role;
}

/**
 * Dados do usuário retornados após validação (sem senha).
 * Usado internamente pelo AuthService.validateUser().
 */
export interface ValidatedUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Resposta padrão de login/registro.
 */
export interface AuthResponse {
  access_token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: Role;
  };
}

/**
 * Dados para criação de um log de auditoria.
 */
export interface AuditLogData {
  userId: string | number | undefined;
  action: string;
  entity: string;
  entityId?: string | number | null;
  details?: Record<string, unknown>;
}

/**
 * Dados para criação de uma notificação.
 */
export interface CreateNotificationData {
  userId: string;
  content: string;
  type: NotificationType;
}

/**
 * Resposta padrão de mensagem simples.
 */
export interface MessageResponse {
  message: string;
}

/**
 * Metadados de paginação retornados nas listagens.
 */
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Resposta paginada genérica.
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

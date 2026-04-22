// types/index.ts

export type Role = 'USER' | 'ADMIN';
export type ProductStatus = 'AVAILABLE' | 'RENTED' | 'MAINTENANCE';
export type LoanStatus = 'REQUESTED' | 'ACTIVE' | 'RETURNED' | 'OVERDUE';
export type NotificationType = 'LOAN_REQUEST' | 'LOAN_APPROVED' | 'LOAN_RETURNED' | 'FAVORITE_ALERT' | 'SYSTEM';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface Product {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  pricePerDay: number;
  status: ProductStatus;
  ownerId: string;
  owner?: { id: string; name: string };
  categories?: Category[];
  _count?: { loans: number };
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  creatorId: string;
  creator?: { id: string; name: string };
  _count?: { products: number };
  createdAt: string;
  updatedAt: string;
}

export interface Loan {
  id: string;
  renterId: string;
  productId: string;
  startDate: string;
  expectedReturnDate: string;
  actualReturnDate: string | null;
  totalPrice: number;
  status: LoanStatus;
  renter?: { id: string; name: string; email: string };
  product?: { id: string; title: string; imageUrl: string | null };
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  content: string;
  read: boolean;
  type: NotificationType;
  userId: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  action: string;
  entity: string;
  entityId: string | null;
  details: Record<string, unknown> | null;
  userId: string;
  user?: { id: string; name: string; email: string };
  createdAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

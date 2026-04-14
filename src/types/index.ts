export type Role = 'admin' | 'librarian';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Book {
  id: number;
  title: string;
  author: string;
  isbn: string;
  coverUrl?: string;
  copies?: BookCopy[];
  _count?: { copies: number; availableCopies: number };
}

export interface BookCopy {
  id: number;
  bookId: number;
  barcode: string;
  available: boolean;
  book?: Book;
}

export interface Member {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  fineBalance: number;
  registrationDate: string;
}

export interface Transaction {
  id: number;
  bookCopyId: number;
  memberId: number;
  issueDate: string;
  dueDate: string;
  returnDate?: string;
  fineAmount: number;
  bookCopy?: BookCopy;
  member?: Member;
}

export interface Payment {
  id: number;
  memberId: number;
  amount: number;
  createdAt: string;
  note?: string;
}

export interface DashboardMetrics {
  totalBooks: number;
  totalCopies: number;
  borrowedCopies: number;
  overdueTransactions: number;
  pendingFines: number;
  collectedFines: number;
}

export interface AuditLog {
  id: number;
  action: string;
  userId: number;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

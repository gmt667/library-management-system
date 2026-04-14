import type { Book, BookCopy, Member, Transaction, Payment, DashboardMetrics, AuditLog, User } from '@/types';

export const mockUsers: (User & { passwordHash: string })[] = [
  { id: 1, name: 'Admin User', email: 'admin@library.com', role: 'admin', passwordHash: 'admin123' },
  { id: 2, name: 'Jane Librarian', email: 'librarian@library.com', role: 'librarian', passwordHash: 'lib123' },
];

export const mockBooks: Book[] = [
  { id: 1, title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', isbn: '9780743273565', coverUrl: 'https://covers.openlibrary.org/b/isbn/9780743273565-M.jpg', _count: { copies: 3, availableCopies: 2 } },
  { id: 2, title: 'To Kill a Mockingbird', author: 'Harper Lee', isbn: '9780061120084', coverUrl: 'https://covers.openlibrary.org/b/isbn/9780061120084-M.jpg', _count: { copies: 4, availableCopies: 1 } },
  { id: 3, title: '1984', author: 'George Orwell', isbn: '9780451524935', coverUrl: 'https://covers.openlibrary.org/b/isbn/9780451524935-M.jpg', _count: { copies: 2, availableCopies: 2 } },
  { id: 4, title: 'Pride and Prejudice', author: 'Jane Austen', isbn: '9780141439518', coverUrl: 'https://covers.openlibrary.org/b/isbn/9780141439518-M.jpg', _count: { copies: 3, availableCopies: 0 } },
  { id: 5, title: 'The Catcher in the Rye', author: 'J.D. Salinger', isbn: '9780316769488', coverUrl: 'https://covers.openlibrary.org/b/isbn/9780316769488-M.jpg', _count: { copies: 2, availableCopies: 1 } },
  { id: 6, title: 'Moby-Dick', author: 'Herman Melville', isbn: '9780142437247', coverUrl: 'https://covers.openlibrary.org/b/isbn/9780142437247-M.jpg', _count: { copies: 1, availableCopies: 1 } },
  { id: 7, title: 'War and Peace', author: 'Leo Tolstoy', isbn: '9780199232765', coverUrl: 'https://covers.openlibrary.org/b/isbn/9780199232765-M.jpg', _count: { copies: 2, availableCopies: 2 } },
  { id: 8, title: 'The Odyssey', author: 'Homer', isbn: '9780140268867', coverUrl: 'https://covers.openlibrary.org/b/isbn/9780140268867-M.jpg', _count: { copies: 3, availableCopies: 3 } },
];

export const mockBookCopies: BookCopy[] = [
  { id: 1, bookId: 1, barcode: 'LIB-GG-001', available: true },
  { id: 2, bookId: 1, barcode: 'LIB-GG-002', available: false },
  { id: 3, bookId: 1, barcode: 'LIB-GG-003', available: true },
  { id: 4, bookId: 2, barcode: 'LIB-TK-001', available: false },
  { id: 5, bookId: 2, barcode: 'LIB-TK-002', available: false },
  { id: 6, bookId: 2, barcode: 'LIB-TK-003', available: false },
  { id: 7, bookId: 2, barcode: 'LIB-TK-004', available: true },
  { id: 8, bookId: 3, barcode: 'LIB-84-001', available: true },
  { id: 9, bookId: 3, barcode: 'LIB-84-002', available: true },
  { id: 10, bookId: 4, barcode: 'LIB-PP-001', available: false },
  { id: 11, bookId: 4, barcode: 'LIB-PP-002', available: false },
  { id: 12, bookId: 4, barcode: 'LIB-PP-003', available: false },
  { id: 13, bookId: 5, barcode: 'LIB-CR-001', available: false },
  { id: 14, bookId: 5, barcode: 'LIB-CR-002', available: true },
  { id: 15, bookId: 6, barcode: 'LIB-MD-001', available: true },
  { id: 16, bookId: 7, barcode: 'LIB-WP-001', available: true },
  { id: 17, bookId: 7, barcode: 'LIB-WP-002', available: true },
  { id: 18, bookId: 8, barcode: 'LIB-OD-001', available: true },
  { id: 19, bookId: 8, barcode: 'LIB-OD-002', available: true },
  { id: 20, bookId: 8, barcode: 'LIB-OD-003', available: true },
];

export const mockMembers: Member[] = [
  { id: 1, fullName: 'Alice Johnson', email: 'alice@mail.com', phone: '555-0101', fineBalance: 5.50, registrationDate: '2024-01-15' },
  { id: 2, fullName: 'Bob Smith', email: 'bob@mail.com', phone: '555-0102', fineBalance: 0, registrationDate: '2024-02-20' },
  { id: 3, fullName: 'Carol Williams', email: 'carol@mail.com', phone: '555-0103', fineBalance: 12.00, registrationDate: '2024-03-10' },
  { id: 4, fullName: 'David Brown', email: 'david@mail.com', phone: '555-0104', fineBalance: 0, registrationDate: '2024-04-05' },
];

export const mockTransactions: Transaction[] = [
  { id: 1, bookCopyId: 1, memberId: 1, issueDate: '2025-03-01', dueDate: '2025-03-15', returnDate: '2025-03-14', fineAmount: 0 },
  { id: 2, bookCopyId: 4, memberId: 2, issueDate: '2025-03-20', dueDate: '2025-04-03', fineAmount: 0 },
  { id: 3, bookCopyId: 5, memberId: 3, issueDate: '2025-03-10', dueDate: '2025-03-24', fineAmount: 12.00 },
  { id: 4, bookCopyId: 2, memberId: 1, issueDate: '2025-04-01', dueDate: '2025-04-15', fineAmount: 0 },
  { id: 5, bookCopyId: 10, memberId: 4, issueDate: '2025-04-05', dueDate: '2025-04-19', fineAmount: 0 },
  { id: 6, bookCopyId: 3, memberId: 1, issueDate: '2025-01-10', dueDate: '2025-01-24', returnDate: '2025-01-22', fineAmount: 0 },
  { id: 7, bookCopyId: 6, memberId: 3, issueDate: '2025-02-05', dueDate: '2025-02-19', returnDate: '2025-02-25', fineAmount: 4.50 },
  { id: 8, bookCopyId: 8, memberId: 2, issueDate: '2025-01-15', dueDate: '2025-01-29', returnDate: '2025-01-28', fineAmount: 0 },
];

export const mockPayments: Payment[] = [
  { id: 1, memberId: 3, amount: 4.50, createdAt: '2025-02-26T10:00:00Z', note: 'Fine for late return — Moby-Dick' },
  { id: 2, memberId: 1, amount: 3.00, createdAt: '2025-03-15T14:00:00Z', note: 'Partial payment' },
  { id: 3, memberId: 1, amount: 2.50, createdAt: '2025-03-20T09:30:00Z', note: 'Remaining balance' },
  { id: 4, memberId: 3, amount: 6.00, createdAt: '2025-04-01T11:00:00Z', note: 'Partial payment toward $12 fine' },
];

export const fineRevenueData = [
  { month: 'Jan', finesAssessed: 8.00, collected: 6.00 },
  { month: 'Feb', finesAssessed: 12.50, collected: 10.00 },
  { month: 'Mar', finesAssessed: 15.00, collected: 11.00 },
  { month: 'Apr', finesAssessed: 22.00, collected: 16.00 },
  { month: 'May', finesAssessed: 9.50, collected: 9.50 },
  { month: 'Jun', finesAssessed: 14.00, collected: 10.50 },
];

export const mockMetrics: DashboardMetrics = {
  totalBooks: 8,
  totalCopies: 20,
  borrowedCopies: 7,
  overdueTransactions: 2,
  pendingFines: 17.50,
  collectedFines: 45.00,
};

export const mockAuditLogs: AuditLog[] = [
  { id: 1, action: 'Book created: The Great Gatsby', userId: 1, createdAt: '2025-03-01T10:00:00Z' },
  { id: 2, action: 'Member registered: Alice Johnson', userId: 2, createdAt: '2025-03-02T11:30:00Z' },
  { id: 3, action: 'Transaction issued: Copy #4 to Bob Smith', userId: 2, createdAt: '2025-03-20T14:00:00Z' },
  { id: 4, action: 'Settings updated: Fine rate changed to $1.50/day', userId: 1, createdAt: '2025-04-01T09:00:00Z' },
];

export const borrowTrendData = [
  { month: 'Jan', borrows: 32, returns: 28 },
  { month: 'Feb', borrows: 45, returns: 40 },
  { month: 'Mar', borrows: 38, returns: 35 },
  { month: 'Apr', borrows: 52, returns: 42 },
  { month: 'May', borrows: 41, returns: 39 },
  { month: 'Jun', borrows: 55, returns: 48 },
];

export const topBorrowedBooks = [
  { name: 'The Great Gatsby', count: 24 },
  { name: 'To Kill a Mockingbird', count: 21 },
  { name: '1984', count: 18 },
  { name: 'Pride and Prejudice', count: 15 },
  { name: 'Catcher in the Rye', count: 12 },
];

export const memberActivityData = [
  { name: 'Active', value: 68 },
  { name: 'Inactive', value: 32 },
];

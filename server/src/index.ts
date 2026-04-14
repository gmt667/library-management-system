import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import booksRoutes from './routes/books.routes';
import transactionsRoutes from './routes/transactions.routes';
import membersRoutes from './routes/members.routes';
import paymentsRoutes from './routes/payments.routes';
import { startNotificationJob } from './jobs/notifications.job';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/books', booksRoutes);
app.use('/api/transactions', transactionsRoutes);
app.use('/api/members', membersRoutes);
app.use('/api/payments', paymentsRoutes);

// Start Cron
startNotificationJob();

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

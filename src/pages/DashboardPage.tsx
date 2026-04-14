import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, Copy, BookMarked, AlertTriangle, DollarSign, TrendingUp } from 'lucide-react';
import { mockMetrics, borrowTrendData, topBorrowedBooks, memberActivityData } from '@/lib/mock-data';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { motion } from 'framer-motion';

const metrics = [
  { label: 'Total Books', value: mockMetrics.totalBooks, icon: BookOpen, color: 'bg-primary/10 text-primary' },
  { label: 'Total Copies', value: mockMetrics.totalCopies, icon: Copy, color: 'bg-accent/10 text-accent' },
  { label: 'Borrowed', value: mockMetrics.borrowedCopies, icon: BookMarked, color: 'bg-success/10 text-success' },
  { label: 'Overdue', value: mockMetrics.overdueTransactions, icon: AlertTriangle, color: 'bg-destructive/10 text-destructive' },
  { label: 'Pending Fines', value: `$${mockMetrics.pendingFines.toFixed(2)}`, icon: DollarSign, color: 'bg-warning/10 text-warning' },
  { label: 'Collected', value: `$${mockMetrics.collectedFines.toFixed(2)}`, icon: TrendingUp, color: 'bg-primary/10 text-primary' },
];

const CHART_COLORS = ['hsl(217, 72%, 40%)', 'hsl(33, 90%, 55%)', 'hsl(142, 60%, 40%)', 'hsl(280, 60%, 50%)', 'hsl(0, 72%, 51%)'];

const DashboardPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-sm">Library overview and analytics</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {metrics.map((m, i) => (
          <motion.div key={m.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="border-border/50">
              <CardContent className="p-4">
                <div className={`w-9 h-9 rounded-lg ${m.color} flex items-center justify-center mb-3`}>
                  <m.icon className="w-4 h-4" />
                </div>
                <p className="text-2xl font-bold text-foreground">{m.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{m.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Borrow/Return Trends */}
        <Card className="border-border/50">
          <CardContent className="p-6">
            <h3 className="text-sm font-semibold text-foreground mb-4">Borrow vs Return Trends</h3>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={borrowTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(220, 10%, 46%)" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(220, 10%, 46%)" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="borrows" stroke={CHART_COLORS[0]} strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="returns" stroke={CHART_COLORS[2]} strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Borrowed Books */}
        <Card className="border-border/50">
          <CardContent className="p-6">
            <h3 className="text-sm font-semibold text-foreground mb-4">Top Borrowed Books</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={topBorrowedBooks} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
                <XAxis type="number" tick={{ fontSize: 12 }} stroke="hsl(220, 10%, 46%)" />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={120} stroke="hsl(220, 10%, 46%)" />
                <Tooltip />
                <Bar dataKey="count" fill={CHART_COLORS[0]} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Member Activity */}
        <Card className="border-border/50">
          <CardContent className="p-6">
            <h3 className="text-sm font-semibold text-foreground mb-4">Member Activity</h3>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={memberActivityData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {memberActivityData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly Borrowing */}
        <Card className="border-border/50">
          <CardContent className="p-6">
            <h3 className="text-sm font-semibold text-foreground mb-4">Monthly Borrowing Volume</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={borrowTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(220, 10%, 46%)" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(220, 10%, 46%)" />
                <Tooltip />
                <Bar dataKey="borrows" fill={CHART_COLORS[1]} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;

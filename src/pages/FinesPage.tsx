import { useState, useMemo } from 'react';
import { useMembers } from '@/hooks/use-members';
import { usePayments, useRecordPayment } from '@/hooks/use-payments';
import { useTransactions } from '@/hooks/use-transactions';
import type { Member, Payment, Transaction } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { DollarSign, TrendingUp, AlertTriangle, CreditCard, Search, Receipt, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const CHART_COLORS = ['hsl(217, 72%, 40%)', 'hsl(142, 60%, 40%)'];

const fineRevenueData = [
  { month: 'Jan', finesAssessed: 15000, collected: 12000 },
  { month: 'Feb', finesAssessed: 12000, collected: 14000 },
  { month: 'Mar', finesAssessed: 18000, collected: 15000 },
  { month: 'Apr', finesAssessed: 8000, collected: 9500 },
];

const FinesPage = () => {
  const { data: membersData, isLoading: loadingMembers } = useMembers();
  const { data: paymentsData, isLoading: loadingPayments } = usePayments();
  const { data: txData, isLoading: loadingTx } = useTransactions();
  const recordPayment = useRecordPayment();

  const members = membersData || [];
  const payments = paymentsData || [];
  const transactions = txData || [];

  const [search, setSearch] = useState('');
  const [payDialogMember, setPayDialogMember] = useState<Member | null>(null);
  const [payAmount, setPayAmount] = useState('');
  const [payNote, setPayNote] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'outstanding' | 'clear'>('all');

  const totalOutstanding = useMemo(() => members.reduce((sum, m) => sum + m.fineBalance, 0), [members]);
  const totalCollected = useMemo(() => payments.reduce((sum, p) => sum + p.amount, 0), [payments]);
  const membersWithFines = useMemo(() => members.filter((m) => m.fineBalance > 0), [members]);

  const getMemberFines = (memberId: number) =>
    transactions.filter((t: Transaction) => t.memberId === memberId && t.fineAmount > 0);

  const getMemberPayments = (memberId: number) =>
    payments.filter((p: Payment) => p.memberId === memberId);

  const filteredMembers = useMemo(() => {
    let list = members;
    if (filterType === 'outstanding') list = list.filter((m) => m.fineBalance > 0);
    if (filterType === 'clear') list = list.filter((m) => m.fineBalance === 0);
    if (search) {
      list = list.filter((m) =>
        m.fullName.toLowerCase().includes(search.toLowerCase()) ||
        m.email.toLowerCase().includes(search.toLowerCase())
      );
    }
    return list;
  }, [members, filterType, search]);

  const handlePayment = () => {
    if (!payDialogMember) return;
    const amount = parseFloat(payAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Enter a valid payment amount');
      return;
    }
    if (amount > payDialogMember.fineBalance) {
      toast.error(`Amount exceeds outstanding balance of MK${payDialogMember.fineBalance}`);
      return;
    }

    recordPayment.mutate(
      { memberId: payDialogMember.id, amount, note: payNote },
      {
        onSuccess: () => {
          const isFullPayment = amount === payDialogMember.fineBalance;
          toast.success(
            isFullPayment
              ? `Full payment of MK${amount} recorded for ${payDialogMember.fullName}`
              : `Partial payment of MK${amount} recorded. Remaining: MK${payDialogMember.fineBalance - amount}`
          );
          setPayDialogMember(null);
          setPayAmount('');
          setPayNote('');
        },
        onError: (err: any) => toast.error(err.message)
      }
    );
  };

  const openPayDialog = (member: Member) => {
    setPayDialogMember(member);
    setPayAmount(member.fineBalance.toString());
    setPayNote('');
  };

  if (loadingMembers || loadingPayments || loadingTx) {
    return (
      <div className="flex h-[50vh] items-center justify-center text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Fines & Payments</h1>
        <p className="text-muted-foreground text-sm">Track fines, record payments, and monitor revenue</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Outstanding', value: `MK${totalOutstanding}`, icon: AlertTriangle, color: 'bg-destructive/10 text-destructive' },
          { label: 'Total Collected', value: `MK${totalCollected}`, icon: TrendingUp, color: 'bg-success/10 text-success' },
          { label: 'Members with Fines', value: membersWithFines.length, icon: DollarSign, color: 'bg-warning/10 text-warning' },
          { label: 'Payments Recorded', value: payments.length, icon: CreditCard, color: 'bg-primary/10 text-primary' },
        ].map((m, i) => (
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

      <Tabs defaultValue="members">
        <TabsList>
          <TabsTrigger value="members">Member Balances</TabsTrigger>
          <TabsTrigger value="history">Payment History</TabsTrigger>
          <TabsTrigger value="analytics">Revenue Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="space-y-4 mt-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input className="pl-9" placeholder="Search members..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Select value={filterType} onValueChange={(v) => setFilterType(v as typeof filterType)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Members</SelectItem>
                <SelectItem value="outstanding">Outstanding Fines</SelectItem>
                <SelectItem value="clear">No Fines</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card className="border-border/50">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Total Fines Incurred</TableHead>
                  <TableHead>Total Paid</TableHead>
                  <TableHead className="text-right">Outstanding</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMembers.map((member) => {
                  const totalFines = getMemberFines(member.id).reduce((s, t) => s + t.fineAmount, 0);
                  const totalPaid = getMemberPayments(member.id).reduce((s, p) => s + p.amount, 0);
                  return (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-medium">
                            {member.fullName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{member.fullName}</p>
                            <p className="text-xs text-muted-foreground">{member.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">MK{totalFines}</TableCell>
                      <TableCell className="text-sm text-success">MK{totalPaid}</TableCell>
                      <TableCell className="text-right">
                        {member.fineBalance > 0 ? (
                          <Badge variant="destructive">MK{member.fineBalance}</Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-success/10 text-success">Clear</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant={member.fineBalance > 0 ? 'default' : 'ghost'}
                          disabled={member.fineBalance <= 0}
                          onClick={() => openPayDialog(member)}
                        >
                          <CreditCard className="w-3.5 h-3.5 mr-1.5" />
                          Pay
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>

          {filteredMembers.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p>No members match your filter</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <Card className="border-border/50">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Member</TableHead>
                  <TableHead>Note</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...payments]
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .map((payment) => {
                    const member = members.find((m) => m.id === payment.memberId);
                    return (
                      <TableRow key={payment.id}>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(payment.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-medium">
                              {member?.fullName.charAt(0) || '?'}
                            </div>
                            <span className="text-sm font-medium">{member?.fullName || 'Unknown'}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{payment.note || '—'}</TableCell>
                        <TableCell className="text-right font-medium text-success">MK{payment.amount}</TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="mt-4">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-border/50">
              <CardContent className="p-6">
                <h3 className="text-sm font-semibold text-foreground mb-4">Fines Assessed vs Collected</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={fineRevenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(220, 10%, 46%)" />
                    <YAxis tick={{ fontSize: 12 }} stroke="hsl(220, 10%, 46%)" tickFormatter={(v) => `MK${v}`} />
                    <Tooltip formatter={(value: number) => [`MK${value}`]} />
                    <Legend />
                    <Bar dataKey="finesAssessed" name="Assessed" fill={CHART_COLORS[0]} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="collected" name="Collected" fill={CHART_COLORS[1]} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardContent className="p-6">
                <h3 className="text-sm font-semibold text-foreground mb-4">Top Outstanding Balances</h3>
                <div className="space-y-4">
                  {[...members]
                    .filter((m) => m.fineBalance > 0)
                    .sort((a, b) => b.fineBalance - a.fineBalance)
                    .slice(0, 5)
                    .map((member) => (
                      <div key={member.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center text-destructive text-sm font-medium">
                            {member.fullName.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">{member.fullName}</p>
                            <p className="text-xs text-muted-foreground">{getMemberFines(member.id).length} fine(s)</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-destructive">MK{member.fineBalance}</p>
                          <Button size="sm" variant="outline" className="mt-1 h-7 text-xs" onClick={() => openPayDialog(member)}>
                            Record Payment
                          </Button>
                        </div>
                      </div>
                    ))}
                  {membersWithFines.length === 0 && (
                    <p className="text-center text-muted-foreground text-sm py-8">No outstanding balances 🎉</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 md:col-span-2">
              <CardContent className="p-6">
                <h3 className="text-sm font-semibold text-foreground mb-4">Recent Fines Detail</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member</TableHead>
                      <TableHead>Book</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Returned</TableHead>
                      <TableHead className="text-right">Fine</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions
                      .filter((t: Transaction) => t.fineAmount > 0)
                      .sort((a: Transaction, b: Transaction) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime())
                      .map((t: Transaction) => {
                        const member = members.find((m) => m.id === t.memberId);
                        return (
                          <TableRow key={t.id}>
                            <TableCell className="font-medium text-sm">{member?.fullName || 'Unknown'}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{t.bookCopy?.book?.title || t.bookCopyId}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{new Date(t.dueDate).toLocaleDateString()}</TableCell>
                            <TableCell className="text-sm">
                              {t.returnDate ? new Date(t.returnDate).toLocaleDateString() : <Badge variant="destructive" className="text-xs">Not returned</Badge>}
                            </TableCell>
                            <TableCell className="text-right font-medium text-destructive">MK{t.fineAmount}</TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={!!payDialogMember} onOpenChange={(open) => !open && setPayDialogMember(null)}>
        <DialogContent className="max-w-md">
          {payDialogMember && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-primary" />
                  Record Payment
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                    {payDialogMember.fullName.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{payDialogMember.fullName}</p>
                    <p className="text-xs text-muted-foreground">Outstanding: <span className="text-destructive font-medium">MK{payDialogMember.fineBalance}</span></p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Payment Amount *</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="number"
                      step="1"
                      min="1"
                      max={payDialogMember.fineBalance}
                      className="pl-9"
                      value={payAmount}
                      onChange={(e) => setPayAmount(e.target.value)}
                      placeholder="0"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="text-xs"
                      onClick={() => setPayAmount(payDialogMember.fineBalance.toString())}
                    >
                      Full — MK{payDialogMember.fineBalance}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="text-xs"
                      onClick={() => setPayAmount((Math.floor(payDialogMember.fineBalance / 2)).toString())}
                    >
                      Half — MK{Math.floor(payDialogMember.fineBalance / 2)}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Note (optional)</Label>
                  <Textarea
                    rows={2}
                    value={payNote}
                    onChange={(e) => setPayNote(e.target.value)}
                    placeholder="e.g. Partial payment, cash, etc."
                  />
                </div>

                <Button className="w-full" onClick={handlePayment} disabled={recordPayment.isPending}>
                  <CreditCard className="w-4 h-4 mr-2" />
                  {recordPayment.isPending ? 'Processing...' : `Record MK${payAmount || '0'} Payment`}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FinesPage;

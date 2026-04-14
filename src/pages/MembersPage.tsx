import { useState, useMemo } from 'react';
import { useMembers, useCreateMember, useUpdateMember, useDeleteMember } from '@/hooks/use-members';
import type { Member, Transaction } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, Edit, Trash2, Users, Eye, DollarSign, BookOpen, AlertTriangle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const ITEMS_PER_PAGE = 10;

const initialForm = {
  fullName: '',
  dateOfBirth: '',
  gender: '',
  phone: '',
  email: '',
  address: '',
  location: '',
  school: '',
  studentId: '',
  guardianName: '',
  guardianPhone: '',
  guardianRelation: ''
};

const MembersPage = () => {
  const { data: membersData, isLoading } = useMembers();
  const createMember = useCreateMember();
  const updateMember = useUpdateMember();
  const deleteMember = useDeleteMember();

  const members = membersData || [];

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailMember, setDetailMember] = useState<Member | null>(null);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [form, setForm] = useState(initialForm);

  const filtered = useMemo(
    () =>
      members.filter(
        (m) =>
          m.fullName.toLowerCase().includes(search.toLowerCase()) ||
          m.email.toLowerCase().includes(search.toLowerCase()) ||
          m.phone.includes(search)
      ),
    [members, search]
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const getActiveLoans = (member: Member) =>
    (member.transactions || []).filter((t: Transaction) => !t.returnDate);

  const getBookTitle = (bookCopyId: number, memberTransactions: any[]) => {
    const tx = memberTransactions.find(t => t.bookCopyId === bookCopyId);
    return tx?.bookCopy?.book?.title || `Copy #${bookCopyId}`;
  };

  const openAdd = () => {
    setEditingMember(null);
    setForm(initialForm);
    setDialogOpen(true);
  };

  const openEdit = (member: Member) => {
    setEditingMember(member);
    setForm({
      fullName: member.fullName,
      dateOfBirth: new Date(member.dateOfBirth).toISOString().split('T')[0],
      gender: member.gender || '',
      phone: member.phone,
      email: member.email,
      address: member.address,
      location: member.location,
      school: member.school,
      studentId: member.studentId || '',
      guardianName: member.guardianName,
      guardianPhone: member.guardianPhone,
      guardianRelation: member.guardianRelation,
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.fullName || !form.phone || !form.email || !form.dateOfBirth || !form.guardianName) {
      toast.error('Please fill in all core required fields');
      return;
    }
    
    if (editingMember) {
      updateMember.mutate(
        { id: editingMember.id, ...form },
        { 
          onSuccess: () => { toast.success('Member updated'); setDialogOpen(false); },
          onError: (err: any) => toast.error(err.message) 
        }
      );
    } else {
      createMember.mutate(
        form,
        { 
          onSuccess: () => { toast.success('Member registered safely!'); setDialogOpen(false); },
          onError: (err: any) => toast.error(err.message) 
        }
      );
    }
  };

  const handleDelete = (member: Member) => {
    deleteMember.mutate(member.id, {
      onSuccess: () => toast.success('Member profile strictly removed'),
      onError: (err: any) => toast.error(err.message)
    });
  };

  const getTransactionStatus = (t: Transaction) => {
    if (t.returnDate) return 'returned';
    const now = new Date();
    const due = new Date(t.dueDate);
    return now > due ? 'overdue' : 'active';
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Members</h1>
          <p className="text-muted-foreground text-sm">{members.length} registered members</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAdd}><Plus className="w-4 h-4 mr-2" /> Register Member</Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingMember ? 'Edit Profile' : 'Comprehensive Registration'}</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 pt-4">
              
              <div className="col-span-full border-b pb-2 mb-2"><h3 className="font-semibold text-primary">Personal Information</h3></div>
              <div className="space-y-2"><Label>Full Name *</Label><Input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} /></div>
              <div className="space-y-2"><Label>Date of Birth *</Label><Input type="date" value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} /></div>
              <div className="space-y-2">
                <Label>Gender</Label>
                <Select value={form.gender} onValueChange={(v) => setForm({ ...form, gender: v })}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-full border-b pb-2 mb-2 mt-4"><h3 className="font-semibold text-primary">Contact & Location</h3></div>
              <div className="space-y-2"><Label>Phone Number *</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
              <div className="space-y-2"><Label>Email Address *</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              <div className="space-y-2"><Label>Home Address *</Label><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
              <div className="space-y-2"><Label>Location (City/District) *</Label><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>

              <div className="col-span-full border-b pb-2 mb-2 mt-4"><h3 className="font-semibold text-primary">Academic Information</h3></div>
              <div className="space-y-2"><Label>School Attended *</Label><Input value={form.school} onChange={(e) => setForm({ ...form, school: e.target.value })} /></div>
              <div className="space-y-2"><Label>Student ID (Optional)</Label><Input value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })} /></div>

              <div className="col-span-full border-b pb-2 mb-2 mt-4"><h3 className="font-semibold text-primary">Parent / Guardian Information</h3></div>
              <div className="space-y-2"><Label>Guardian Name *</Label><Input value={form.guardianName} onChange={(e) => setForm({ ...form, guardianName: e.target.value })} /></div>
              <div className="space-y-2"><Label>Guardian Phone *</Label><Input value={form.guardianPhone} onChange={(e) => setForm({ ...form, guardianPhone: e.target.value })} /></div>
              <div className="space-y-2"><Label>Relationship *</Label><Input placeholder="e.g. Father, Mother" value={form.guardianRelation} onChange={(e) => setForm({ ...form, guardianRelation: e.target.value })} /></div>

              <div className="col-span-full mt-6">
                <Button className="w-full" size="lg" onClick={handleSave} disabled={createMember.isPending || updateMember.isPending}>
                  {createMember.isPending || updateMember.isPending ? 'Saving...' : editingMember ? 'Update Profile' : 'Complete Registration'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input className="pl-9" placeholder="Search by name, email, or phone..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
      </div>

      <Dialog open={!!detailMember} onOpenChange={(open) => !open && setDetailMember(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {detailMember && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
                    {detailMember.fullName.charAt(0)}
                  </div>
                  <div>
                    <p>{detailMember.fullName}</p>
                    <p className="text-sm text-muted-foreground font-normal">{detailMember.school} · ID: {detailMember.studentId}</p>
                  </div>
                </DialogTitle>
              </DialogHeader>

              <div className="grid grid-cols-3 gap-3 my-4">
                <Card className="border-border/50">
                  <CardContent className="p-3 text-center">
                    <BookOpen className="w-4 h-4 mx-auto mb-1 text-primary" />
                    <p className="text-lg font-bold text-foreground">{(detailMember.transactions || []).length}</p>
                    <p className="text-xs text-muted-foreground">Total Borrows</p>
                  </CardContent>
                </Card>
                <Card className="border-border/50">
                  <CardContent className="p-3 text-center">
                    <AlertTriangle className="w-4 h-4 mx-auto mb-1 text-warning" />
                    <p className="text-lg font-bold text-foreground">{getActiveLoans(detailMember).length}</p>
                    <p className="text-xs text-muted-foreground">Active Loans</p>
                  </CardContent>
                </Card>
                <Card className="border-border/50">
                  <CardContent className="p-3 text-center">
                    <DollarSign className="w-4 h-4 mx-auto mb-1 text-destructive" />
                    <p className="text-lg font-bold text-foreground">MK{detailMember.fineBalance}</p>
                    <p className="text-xs text-muted-foreground">Fine Balance</p>
                  </CardContent>
                </Card>
              </div>

              <div className="bg-muted/40 p-4 rounded-lg my-4 space-y-2 text-sm text-foreground">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-xs text-muted-foreground uppercase mb-1">Contact</h4>
                    <p>{detailMember.phone}</p>
                    <p>{detailMember.email}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-xs text-muted-foreground uppercase mb-1">Geography</h4>
                    <p>{detailMember.address}</p>
                    <p>{detailMember.location}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-xs text-muted-foreground uppercase mb-1">Parent / Guardian</h4>
                    <p className="font-medium">{detailMember.guardianName} ({detailMember.guardianRelation})</p>
                    <p>{detailMember.guardianPhone}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-xs text-muted-foreground uppercase mb-1">Birth Date</h4>
                    <p>{new Date(detailMember.dateOfBirth).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              <Tabs defaultValue="history">
                <TabsList className="w-full">
                  <TabsTrigger value="history" className="flex-1">Borrow History</TabsTrigger>
                  <TabsTrigger value="fines" className="flex-1">Fines Breakdown</TabsTrigger>
                </TabsList>
                
                <TabsContent value="history" className="mt-3">
                  {(detailMember.transactions || []).length === 0 ? (
                    <p className="text-center text-muted-foreground py-6 text-sm">No borrow history</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Book</TableHead>
                          <TableHead>Issued</TableHead>
                          <TableHead>Due</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(detailMember.transactions || []).map((t: Transaction) => (
                          <TableRow key={t.id}>
                            <TableCell className="font-medium text-sm">{t.bookCopy?.book?.title || `Copy ${t.bookCopyId}`}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{new Date(t.issueDate).toLocaleDateString()}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{new Date(t.dueDate).toLocaleDateString()}</TableCell>
                            <TableCell>
                              {t.returnDate ? <Badge variant="secondary">Returned</Badge> 
                                : <Badge className="bg-success">Active</Badge>}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </TabsContent>
                
                <TabsContent value="fines" className="mt-3">
                  {(detailMember.transactions || []).filter((t: Transaction) => t.fineAmount > 0).length === 0 ? (
                    <p className="text-center text-muted-foreground py-6 text-sm">No fine history</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Book</TableHead>
                          <TableHead>Due Date</TableHead>
                          <TableHead>Returned</TableHead>
                          <TableHead className="text-right">Fine</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(detailMember.transactions || [])
                          .filter((t: Transaction) => t.fineAmount > 0)
                          .map((t: Transaction) => (
                          <TableRow key={t.id}>
                            <TableCell className="font-medium text-sm">{t.bookCopy?.book?.title || t.bookCopyId}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{new Date(t.dueDate).toLocaleDateString()}</TableCell>
                            <TableCell className="text-sm">
                              {t.returnDate ? <span className="text-muted-foreground">Returned {new Date(t.returnDate).toLocaleDateString()}</span> : <Badge variant="destructive" className="text-xs">Not returned</Badge>}
                            </TableCell>
                            <TableCell className="text-right font-medium text-destructive">MK{t.fineAmount}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </TabsContent>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Card className="border-border/50">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member Identity</TableHead>
              <TableHead>School & Age</TableHead>
              <TableHead className="text-center">Active Loans</TableHead>
              <TableHead className="text-right">Fine Balance</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.map((member, i) => {
              const activeLoans = getActiveLoans(member);
              const age = new Date().getFullYear() - new Date(member.dateOfBirth).getFullYear();
              return (
                <motion.tr
                  key={member.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b border-border transition-colors hover:bg-muted/50"
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-medium">
                        {member.fullName.charAt(0)}
                      </div>
                      <div>
                        <span className="font-medium block">{member.fullName} <span className="text-xs text-muted-foreground">#{member.id}</span></span>
                        <span className="text-xs text-muted-foreground">{member.phone}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="block">{member.school}</span>
                    <span className="text-xs text-muted-foreground">{age} yrs old</span>
                  </TableCell>
                  <TableCell className="text-center">
                    {activeLoans.length > 0 ? (
                      <Badge variant="secondary">{activeLoans.length}</Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {member.fineBalance > 0 ? (
                      <span className="font-medium text-destructive">MK{member.fineBalance}</span>
                    ) : (
                      <span className="text-muted-foreground text-sm">MK0</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setDetailMember(member)}>
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openEdit(member)}>
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(member)}
                        disabled={deleteMember.isPending}
                        title={activeLoans.length > 0 ? 'Cannot delete — active loans exist' : 'Delete member'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </motion.tr>
              );
            })}
          </TableBody>
        </Table>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <p className="text-muted-foreground">
            Showing {(page - 1) * ITEMS_PER_PAGE + 1}–{Math.min(page * ITEMS_PER_PAGE, filtered.length)} of {filtered.length}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</Button>
          </div>
        </div>
      )}

      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p>No members found</p>
        </div>
      )}
    </div>
  );
};

export default MembersPage;

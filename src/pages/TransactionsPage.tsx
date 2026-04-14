import { useState } from 'react';
import { 
  useTransactions, 
  useLookupBarcode, 
  useBorrowBook, 
  useReturnBook 
} from '@/hooks/use-transactions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Barcode, BookOpen, User, Calendar, CreditCard, ArrowRightLeft } from 'lucide-react';
import { toast } from 'sonner';

const TransactionsPage = () => {
  const [scanInput, setScanInput] = useState('');
  const [activeBarcode, setActiveBarcode] = useState('');
  const [memberIdStr, setMemberIdStr] = useState('');

  const { data: historyData, isLoading: loadingHistory } = useTransactions();
  const { data: lookupData, isLoading: loadingLookup } = useLookupBarcode(activeBarcode);
  const borrowMutation = useBorrowBook();
  const returnMutation = useReturnBook();

  const handleScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scanInput.trim()) return;
    setActiveBarcode(scanInput.trim());
  };

  const handleBorrow = () => {
    const memberId = parseInt(memberIdStr, 10);
    if (isNaN(memberId)) {
      toast.error('Please enter a valid numeric Member ID');
      return;
    }
    borrowMutation.mutate({ barcode: activeBarcode, memberId }, {
      onSuccess: () => {
        toast.success(`Successfully loaned to Member #${memberId}`);
        setActiveBarcode('');
        setScanInput('');
        setMemberIdStr('');
      },
      onError: (err: any) => toast.error(err.message)
    });
  };

  const handleReturn = () => {
    returnMutation.mutate(activeBarcode, {
      onSuccess: (data) => {
        toast.success(data.message);
        if (data.fineAmount > 0) {
          toast.warning(`Late return! MK${data.fineAmount} fine assessed.`);
        }
        setActiveBarcode('');
        setScanInput('');
      },
      onError: (err: any) => toast.error(err.message)
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Circulation Desk</h1>
        <p className="text-muted-foreground text-sm">Issue and process library returns</p>
      </div>

      <Tabs defaultValue="desk">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="desk">Active Desk</TabsTrigger>
          <TabsTrigger value="history">Transaction History</TabsTrigger>
        </TabsList>

        <TabsContent value="desk" className="mt-4">
          <div className="grid md:grid-cols-2 gap-6">
            
            {/* SCANNER CONSOLE */}
            <Card className="border-border/50 shadow-md">
              <CardHeader className="bg-muted/50 border-b border-border/50">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Barcode className="w-5 h-5 text-primary" />
                  Barcode Scanner
                </CardTitle>
                <CardDescription>Scan a library item to process a loan or return</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleScan} className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      placeholder="e.g. LIB-GG-001" 
                      className="pl-9 font-mono text-lg"
                      value={scanInput}
                      onChange={e => setScanInput(e.target.value)}
                      autoFocus
                    />
                  </div>
                  <Button type="submit" disabled={loadingLookup}>
                    {loadingLookup ? 'Scanning...' : 'Scan'}
                  </Button>
                </form>

                {activeBarcode && !loadingLookup && lookupData && (
                  <div className="mt-8 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="flex gap-4 p-4 border border-border rounded-lg bg-card">
                      <div className="w-16 h-20 bg-muted shrink-0 rounded flex items-center justify-center">
                        <BookOpen className="w-8 h-8 text-muted-foreground/50" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-lg truncate">{lookupData.copy.book?.title}</h3>
                            <p className="text-sm text-muted-foreground">{lookupData.copy.book?.author}</p>
                          </div>
                          <Badge variant={lookupData.copy.available ? 'default' : 'destructive'}>
                            {lookupData.copy.available ? 'Available' : 'Borrowed'}
                          </Badge>
                        </div>
                        <p className="font-mono text-xs mt-2 text-muted-foreground">Barcode: {lookupData.copy.barcode}</p>
                      </div>
                    </div>

                    {/* DYNAMIC ACTION AREA */}
                    {lookupData.copy.available ? (
                      <div className="space-y-4 p-4 bg-muted/30 rounded-lg border border-border/50">
                        <h4 className="text-sm font-medium flex items-center gap-2">
                          <User className="w-4 h-4 text-primary" /> Issue Loan
                        </h4>
                        <div className="space-y-2">
                          <Label>Member ID / Card Number</Label>
                          <Input 
                            placeholder="e.g. 1" 
                            type="number"
                            value={memberIdStr}
                            onChange={e => setMemberIdStr(e.target.value)}
                          />
                        </div>
                        <Button 
                          className="w-full" 
                          onClick={handleBorrow}
                          disabled={!memberIdStr || borrowMutation.isPending}
                        >
                          <ArrowRightLeft className="w-4 h-4 mr-2" />
                          {borrowMutation.isPending ? 'Processing...' : 'Complete Loan'}
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4 p-4 bg-destructive/5 rounded-lg border border-destructive/20">
                         <h4 className="text-sm font-medium flex items-center gap-2 text-destructive">
                          <Calendar className="w-4 h-4" /> Process Return
                        </h4>
                        {lookupData.activeTransaction && (
                          <div className="text-sm space-y-1">
                            <p><span className="text-muted-foreground">Borrowed By:</span> {lookupData.activeTransaction.member?.fullName}</p>
                            <p><span className="text-muted-foreground">Due Date:</span> {new Date(lookupData.activeTransaction.dueDate).toLocaleDateString()}</p>
                          </div>
                        )}
                        <Button 
                          variant="destructive"
                          className="w-full" 
                          onClick={handleReturn}
                          disabled={returnMutation.isPending}
                        >
                          <CreditCard className="w-4 h-4 mr-2" />
                          {returnMutation.isPending ? 'Processing...' : 'Complete Return'}
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {activeBarcode && !loadingLookup && !lookupData && (
                   <div className="mt-8 text-center p-6 border border-dashed border-destructive/50 rounded-lg bg-destructive/5">
                      <p className="text-destructive font-medium">Barcode not recognized.</p>
                      <p className="text-sm text-muted-foreground mt-1">Please verify the barcode or add it via the Books page.</p>
                   </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-md">
              <CardHeader className="bg-muted/50 border-b border-border/50">
                <CardTitle className="text-lg">Instructions</CardTitle>
              </CardHeader>
              <CardContent className="p-6 text-sm text-muted-foreground space-y-4 leading-relaxed">
                <p>Welcome to the Phase 2 active Transactions Circulation Desk.</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong>Borrowing:</strong> Scan any available book copy. Enter the Member ID of the borrower to automatically issue a 14-day loan (configured in System Settings).</li>
                  <li><strong>Returning:</strong> Scan any currently borrowed book. The system will automatically compute if the book is overdue and inject a MK500 daily penalty into the Member's balance!</li>
                  <li>In a production environment, this integrates directly with an optical barcode scanner. Simply click the input box and squeeze the trigger.</li>
                </ul>
              </CardContent>
            </Card>

          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <Card className="border-border/50">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Issue Date</TableHead>
                  <TableHead>Book & Barcode</TableHead>
                  <TableHead>Member</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Generated Fine</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingHistory ? (
                   <TableRow>
                     <TableCell colSpan={6} className="text-center py-6">Loading history...</TableCell>
                   </TableRow>
                ) : historyData?.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell className="text-sm text-muted-foreground">{new Date(tx.issueDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <p className="font-medium text-sm">{tx.bookCopy?.book?.title}</p>
                      <p className="text-xs text-muted-foreground font-mono">{tx.bookCopy?.barcode}</p>
                    </TableCell>
                    <TableCell className="text-sm font-medium">{tx.member?.fullName}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{new Date(tx.dueDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {tx.returnDate ? (
                        <Badge variant="secondary">Returned</Badge>
                      ) : (
                         new Date() > new Date(tx.dueDate) ? 
                         <Badge variant="destructive">Overdue</Badge> : 
                         <Badge className="bg-success text-success-foreground">Active</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {tx.fineAmount > 0 ? (
                        <span className="font-medium text-destructive">MK{tx.fineAmount}</span>
                      ) : (
                        <span className="text-muted-foreground">--</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TransactionsPage;

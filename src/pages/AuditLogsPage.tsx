import { useState } from 'react';
import { mockAuditLogs, mockUsers } from '@/lib/mock-data';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search } from 'lucide-react';
import { format } from 'date-fns';

const AuditLogsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const enrichedLogs = mockAuditLogs.map(log => {
    const user = mockUsers.find(u => u.id === log.userId);
    return { ...log, userName: user?.name || 'Unknown User' };
  });

  const filteredLogs = enrichedLogs.filter(log =>
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.userName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in zoom-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Audit Logs</h1>
        <p className="text-muted-foreground mt-2">Monitor all system actions and user activities.</p>
      </div>

      <Card className="shadow-lg border-primary/20 hover:border-primary/50 transition-colors">
        <CardHeader className="bg-muted/40 pb-4">
          <CardTitle className="text-xl">Action History</CardTitle>
          <div className="relative mt-4 w-full md:w-96">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Filter by action or user name..."
              className="pl-10 h-10 w-full rounded-md border-muted focus-visible:ring-primary"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="w-[180px] px-6">Timestamp</TableHead>
                  <TableHead className="px-6">User</TableHead>
                  <TableHead className="px-6">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.length > 0 ? (
                  filteredLogs.map((log) => (
                    <TableRow key={log.id} className="hover:bg-muted/50 transition-colors">
                      <TableCell className="px-6 font-medium text-sm text-muted-foreground">
                        {format(new Date(log.createdAt), 'MMM dd, yyyy HH:mm')}
                      </TableCell>
                      <TableCell className="px-6 font-medium text-foreground">
                        {log.userName}
                      </TableCell>
                      <TableCell className="px-6 text-foreground/80">
                        {log.action}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="h-32 text-center text-muted-foreground">
                      No matching logs found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuditLogsPage;

import { useState, useMemo } from 'react';
import type { Book, BookCopy } from '@/types';
import { useBooks, useCreateBook, useUpdateBook, useDeleteBook, useCreateCopy, useDeleteCopy } from '@/hooks/use-books';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Plus, LayoutGrid, List, BookOpen, Edit, Trash2, Copy, Eye, Barcode, CirclePlus, CircleMinus, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const BooksPage = () => {
  const { data: booksData, isLoading, error } = useBooks();
  const createBook = useCreateBook();
  const updateBook = useUpdateBook();
  const deleteBook = useDeleteBook();
  const createCopy = useCreateCopy();
  const deleteCopy = useDeleteCopy();

  const books = booksData || [];

  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [form, setForm] = useState({ title: '', author: '', isbn: '', coverUrl: '' });
  const [copiesDialogBook, setCopiesDialogBook] = useState<Book | null>(null);
  const [newBarcode, setNewBarcode] = useState('');

  const booksWithCounts = useMemo(() =>
    books.map((b) => {
      const copies = b.copies || [];
      return {
        ...b,
        _count: { 
          copies: copies.length, 
          availableCopies: copies.filter((c) => c.available).length 
        },
      };
    }),
    [books]
  );

  const filtered = booksWithCounts.filter(
    (b) =>
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.author.toLowerCase().includes(search.toLowerCase()) ||
      b.isbn.includes(search)
  );

  const openAdd = () => {
    setEditingBook(null);
    setForm({ title: '', author: '', isbn: '', coverUrl: '' });
    setDialogOpen(true);
  };

  const openEdit = (book: Book) => {
    setEditingBook(book);
    setForm({ title: book.title, author: book.author, isbn: book.isbn, coverUrl: book.coverUrl || '' });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.title || !form.author || !form.isbn) {
      toast.error('Title, author, and ISBN are required');
      return;
    }
    if (editingBook) {
      updateBook.mutate(
        { id: editingBook.id, ...form },
        { 
          onSuccess: () => { toast.success('Book updated'); setDialogOpen(false); },
          onError: (err: any) => toast.error(err.message) 
        }
      );
    } else {
      createBook.mutate(
        form,
        { 
          onSuccess: () => { toast.success('Book added'); setDialogOpen(false); },
          onError: (err: any) => toast.error(err.message) 
        }
      );
    }
  };

  const handleDelete = (id: number) => {
    deleteBook.mutate(id, {
      onSuccess: () => toast.success('Book deleted'),
      onError: (err: any) => toast.error(err.message)
    });
  };

  // Copy management
  const getBookCopies = (bookId: number) => {
    const book = books.find(b => b.id === bookId);
    return book?.copies || [];
  };

  const addCopy = () => {
    if (!copiesDialogBook) return;
    const barcode = newBarcode.trim();
    if (!barcode) { toast.error('Barcode is required'); return; }
    
    createCopy.mutate(
      { bookId: copiesDialogBook.id, barcode },
      {
        onSuccess: () => {
          toast.success(`Copy ${barcode} added`);
          setNewBarcode('');
        },
        onError: (err: any) => toast.error(err.message)
      }
    );
  };

  const removeCopy = (copy: BookCopy) => {
    deleteCopy.mutate(copy.id, {
      onSuccess: () => toast.success(`Copy ${copy.barcode} removed`),
      onError: (err: any) => toast.error(err.message)
    });
  };

  const generateBarcode = () => {
    if (!copiesDialogBook) return;
    const prefix = copiesDialogBook.title.substring(0, 2).toUpperCase();
    const num = getBookCopies(copiesDialogBook.id).length + 1;
    setNewBarcode(`LIB-${prefix}-${String(num).padStart(3, '0')}`);
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[50vh] items-center justify-center text-destructive">
        <p>Error loading books: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Books</h1>
          <p className="text-muted-foreground text-sm">{books.length} titles</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAdd}><Plus className="w-4 h-4 mr-2" /> Add Book</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingBook ? 'Edit Book' : 'Add New Book'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2"><Label>Title *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
              <div className="space-y-2"><Label>Author *</Label><Input value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} /></div>
              <div className="space-y-2"><Label>ISBN *</Label><Input value={form.isbn} onChange={(e) => setForm({ ...form, isbn: e.target.value })} /></div>
              <div className="space-y-2"><Label>Cover URL</Label><Input value={form.coverUrl} onChange={(e) => setForm({ ...form, coverUrl: e.target.value })} placeholder="https://..." /></div>
              <Button 
                className="w-full" 
                onClick={handleSave}
                disabled={createBook.isPending || updateBook.isPending}
              >
                {createBook.isPending || updateBook.isPending ? 'Saving...' : editingBook ? 'Save Changes' : 'Add Book'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search & View Toggle */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search by title, author, or ISBN..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex border border-border rounded-lg overflow-hidden">
          <button onClick={() => setViewMode('grid')} className={`p-2 ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground hover:bg-muted'}`}>
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button onClick={() => setViewMode('list')} className={`p-2 ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground hover:bg-muted'}`}>
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Copies Management Dialog */}
      <Dialog open={!!copiesDialogBook} onOpenChange={(open) => !open && setCopiesDialogBook(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          {copiesDialogBook && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Barcode className="w-5 h-5 text-primary" />
                  Copies — {copiesDialogBook.title}
                </DialogTitle>
              </DialogHeader>

              <div className="text-sm text-muted-foreground mb-4">
                {getBookCopies(copiesDialogBook.id).length} copies · {getBookCopies(copiesDialogBook.id).filter((c) => c.available).length} available
              </div>

              {/* Add copy */}
              <div className="flex gap-2 mb-4">
                <div className="flex-1 relative">
                  <Input placeholder="Enter barcode..." value={newBarcode} onChange={(e) => setNewBarcode(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addCopy()} />
                </div>
                <Button variant="outline" size="sm" onClick={generateBarcode} title="Auto-generate barcode">
                  <Barcode className="w-4 h-4" />
                </Button>
                <Button size="sm" onClick={addCopy} disabled={createCopy.isPending}>
                  <CirclePlus className="w-4 h-4 mr-1" /> {createCopy.isPending ? '...' : 'Add'}
                </Button>
              </div>

              {/* Copies list */}
              {getBookCopies(copiesDialogBook.id).length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  <Copy className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  No copies yet. Add one above.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Barcode</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getBookCopies(copiesDialogBook.id).map((copy) => (
                      <TableRow key={copy.id}>
                        <TableCell className="font-mono text-sm">{copy.barcode}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant={copy.available ? 'default' : 'destructive'} className={copy.available ? 'bg-success text-success-foreground' : ''}>
                            {copy.available ? 'Available' : 'Borrowed'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            onClick={() => removeCopy(copy)}
                            disabled={!copy.available || deleteCopy.isPending}
                            title={!copy.available ? 'Cannot remove borrowed copy' : 'Remove copy'}
                          >
                            <CircleMinus className="w-3.5 h-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Grid View */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map((book, i) => (
            <motion.div key={book.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <Card className="border-border/50 overflow-hidden group hover:shadow-md transition-shadow">
                <div className="aspect-[3/4] bg-muted relative overflow-hidden">
                  {book.coverUrl ? (
                    <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><BookOpen className="w-10 h-10 text-muted-foreground/40" /></div>
                  )}
                  <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                    <Button size="icon" variant="secondary" className="h-8 w-8" onClick={() => setCopiesDialogBook(book)} title="Manage copies">
                      <Eye className="w-3.5 h-3.5" />
                    </Button>
                    <Button size="icon" variant="secondary" className="h-8 w-8" onClick={() => openEdit(book)}>
                      <Edit className="w-3.5 h-3.5" />
                    </Button>
                    <Button size="icon" variant="destructive" className="h-8 w-8" onClick={() => handleDelete(book.id)} disabled={deleteBook.isPending}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
                <CardContent className="p-3">
                  <h3 className="font-medium text-sm text-foreground truncate">{book.title}</h3>
                  <p className="text-xs text-muted-foreground truncate">{book.author}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary" className="text-xs cursor-pointer hover:bg-secondary/80" onClick={() => setCopiesDialogBook(book)}>
                      <Copy className="w-3 h-3 mr-1" />{book._count?.copies || 0}
                    </Badge>
                    <Badge variant={book._count?.availableCopies ? 'default' : 'destructive'} className="text-xs">
                      {book._count?.availableCopies || 0} avail
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <Card className="border-border/50">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>ISBN</TableHead>
                <TableHead className="text-center">Copies</TableHead>
                <TableHead className="text-center">Available</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((book) => (
                <TableRow key={book.id}>
                  <TableCell className="font-medium">{book.title}</TableCell>
                  <TableCell className="text-muted-foreground">{book.author}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{book.isbn}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80" onClick={() => setCopiesDialogBook(book)}>
                      {book._count?.copies || 0}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={book._count?.availableCopies ? 'default' : 'destructive'}>{book._count?.availableCopies || 0}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setCopiesDialogBook(book)} title="Manage copies">
                        <Barcode className="w-3.5 h-3.5" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openEdit(book)}>
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(book.id)} disabled={deleteBook.isPending}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p>No books found</p>
        </div>
      )}
    </div>
  );
};

export default BooksPage;

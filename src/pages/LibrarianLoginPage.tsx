import { useState } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { BookOpen, AlertCircle, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const LibrarianLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password, 'librarian');
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 relative">
      {/* Subtle top accent bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent via-accent/80 to-accent/40" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <button
          onClick={() => navigate('/login')}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to portal selection
        </button>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent mb-4 shadow-lg shadow-accent/20">
            <BookOpen className="w-8 h-8 text-accent-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Librarian Portal</h1>
          <p className="text-muted-foreground mt-1">Staff access — library operations</p>
        </div>

        <Card className="shadow-xl border-accent/20">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-center gap-2">
              <div className="h-px flex-1 bg-accent/20" />
              <p className="text-xs font-medium text-accent uppercase tracking-wider">Staff Login</p>
              <div className="h-px flex-1 bg-accent/20" />
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="lib-email">Email</Label>
                <Input id="lib-email" type="email" placeholder="librarian@library.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lib-password">Password</Label>
                <Input id="lib-password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>

              <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={loading}>
                {loading ? 'Authenticating...' : 'Sign In as Librarian'}
              </Button>

              <div className="text-xs text-muted-foreground pt-2 border-t border-border">
                <p><strong>Demo:</strong> librarian@library.com / lib123</p>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default LibrarianLoginPage;

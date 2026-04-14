import { useNavigate } from 'react-router-dom';
import { Shield, BookOpen } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';

const portals = [
  {
    role: 'Admin',
    path: '/admin/login',
    icon: Shield,
    description: 'Full system control, staff management, reports & settings',
    accentClass: 'bg-primary text-primary-foreground shadow-primary/20',
    borderClass: 'hover:border-primary/40',
  },
  {
    role: 'Librarian',
    path: '/librarian/login',
    icon: BookOpen,
    description: 'Book catalog, member management, borrow & return operations',
    accentClass: 'bg-accent text-accent-foreground shadow-accent/20',
    borderClass: 'hover:border-accent/40',
  },
];

const PortalSelectPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg"
      >
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-foreground/5 mb-4">
            <BookOpen className="w-8 h-8 text-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">LibraryOS</h1>
          <p className="text-muted-foreground mt-1">Select your portal to continue</p>
        </div>

        <div className="grid gap-4">
          {portals.map((portal, i) => (
            <motion.div
              key={portal.role}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.1 }}
            >
              <Card
                className={`cursor-pointer border-border/50 transition-all duration-200 hover:shadow-lg ${portal.borderClass}`}
                onClick={() => navigate(portal.path)}
              >
                <CardContent className="flex items-center gap-5 p-6">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 shadow-lg ${portal.accentClass}`}>
                    <portal.icon className="w-7 h-7" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-semibold text-foreground">{portal.role} Portal</h2>
                    <p className="text-sm text-muted-foreground mt-0.5">{portal.description}</p>
                  </div>
                  <div className="text-muted-foreground/40 shrink-0">→</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default PortalSelectPage;

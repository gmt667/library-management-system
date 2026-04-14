import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth-store';
import {
  LayoutDashboard, BookOpen, Users, ArrowLeftRight, DollarSign,
  Settings, ScrollText, LogOut, ChevronLeft, Menu,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'librarian'] },
  { to: '/books', label: 'Books', icon: BookOpen, roles: ['admin', 'librarian'] },
  { to: '/members', label: 'Members', icon: Users, roles: ['admin', 'librarian'] },
  { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight, roles: ['admin', 'librarian'] },
  { to: '/fines', label: 'Fines & Payments', icon: DollarSign, roles: ['admin', 'librarian'] },
  { to: '/audit-logs', label: 'Audit Logs', icon: ScrollText, roles: ['admin'] },
  { to: '/settings', label: 'Settings', icon: Settings, roles: ['admin'] },
];

const AppLayout = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const filteredNav = navItems.filter((item) => user && item.roles.includes(user.role));

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className={cn("flex items-center gap-3 px-4 py-5 border-b border-sidebar-border", collapsed && "justify-center px-2")}>
        <div className="w-9 h-9 rounded-xl bg-sidebar-primary flex items-center justify-center shrink-0">
          <BookOpen className="w-5 h-5 text-sidebar-primary-foreground" />
        </div>
        {!collapsed && <span className="text-lg font-bold text-sidebar-primary-foreground font-display">LibraryOS</span>}
      </div>

      <nav className="flex-1 py-4 space-y-1 px-2">
        {filteredNav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
                collapsed && "justify-center px-2"
              )
            }
          >
            <item.icon className="w-5 h-5 shrink-0" />
            {!collapsed && item.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        {!collapsed && user && (
          <div className="px-2 mb-3">
            <p className="text-sm font-medium text-sidebar-accent-foreground truncate">{user.name}</p>
            <p className="text-xs text-sidebar-muted capitalize">{user.role}</p>
          </div>
        )}
        <Button
          variant="ghost"
          size={collapsed ? "icon" : "default"}
          className="w-full text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent/50"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4" />
          {!collapsed && <span className="ml-2">Logout</span>}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-foreground/20 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Mobile sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-sidebar transform transition-transform lg:hidden",
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside className={cn(
        "hidden lg:flex flex-col bg-sidebar transition-all duration-300 shrink-0",
        collapsed ? "w-[72px]" : "w-64"
      )}>
        {sidebarContent}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute top-5 -right-3 w-6 h-6 rounded-full bg-card border border-border shadow-sm flex items-center justify-center hover:bg-muted transition-colors hidden lg:flex"
        >
          <ChevronLeft className={cn("w-3 h-3 text-muted-foreground transition-transform", collapsed && "rotate-180")} />
        </button>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-border flex items-center px-4 lg:px-6 bg-card shrink-0">
          <Button variant="ghost" size="icon" className="lg:hidden mr-2" onClick={() => setMobileOpen(true)}>
            <Menu className="w-5 h-5" />
          </Button>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-medium">
              {user?.name?.charAt(0)}
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;

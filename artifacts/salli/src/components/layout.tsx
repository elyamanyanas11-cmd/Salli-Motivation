import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { BookOpen, Compass, Home, LayoutDashboard, Menu, X, User, LogOut, Users } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLogout } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const logoutMutation = useLogout();

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        window.location.href = "/";
      }
    });
  };

  const navLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/community", label: "Community", icon: Users },
    { href: "/khushoo", label: "Khushu'", icon: Compass },
    { href: "/motivation", label: "Motivation", icon: BookOpen },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary/20">
      <header className="sticky top-0 z-50 glass border-b border-border/50">
        <div className="container max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary/20 transition-colors">
              <Compass className="w-5 h-5" />
            </div>
            <span className="font-serif text-2xl font-bold text-primary">Salli</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = location === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}
            
            <div className="h-6 w-px bg-border mx-2"></div>
            
            {isAuthenticated && user ? (
              <>
                <Link
                  href="/profile"
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2",
                    location === "/profile"
                      ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <User className="w-4 h-4" />
                  {user.displayName}
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-full text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-300 flex items-center gap-2"
                  data-testid="button-logout"
                >
                  <LogOut className="w-4 h-4" />
                  Log out
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 rounded-full text-sm font-medium bg-secondary/10 text-secondary-foreground hover:bg-secondary/20 transition-all duration-300"
                data-testid="link-login-nav"
              >
                Log in
              </Link>
            )}
          </nav>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Nav */}
      <div
        className={cn(
          "fixed inset-0 top-16 z-40 bg-background/95 backdrop-blur-sm md:hidden transition-all duration-300 ease-in-out",
          isMobileMenuOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"
        )}
      >
        <nav className="flex flex-col p-4 gap-2">
          {navLinks.map((link) => {
            const isActive = location === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "p-4 rounded-xl text-base font-medium transition-all flex items-center gap-3",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <Icon className="w-5 h-5" />
                {link.label}
              </Link>
            );
          })}
          
          <div className="h-px w-full bg-border my-2"></div>
          
          {isAuthenticated && user ? (
            <>
              <Link
                href="/profile"
                className={cn(
                  "p-4 rounded-xl text-base font-medium transition-all flex items-center gap-3",
                  location === "/profile"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <User className="w-5 h-5" />
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="p-4 rounded-xl text-base font-medium text-destructive hover:bg-destructive/10 transition-all flex items-center gap-3 text-left"
              >
                <LogOut className="w-5 h-5" />
                Log out
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="p-4 rounded-xl text-base font-medium bg-secondary/10 text-secondary-foreground hover:bg-secondary/20 transition-all text-center mt-2"
            >
              Log in
            </Link>
          )}
        </nav>
      </div>

      <main className="flex-1 w-full max-w-5xl mx-auto p-4 md:p-6 lg:p-8 animate-in fade-in duration-500">
        {children}
      </main>

      <footer className="mt-auto py-8 border-t border-border/50 text-center text-sm text-muted-foreground">
        <p className="font-serif">Salli — Your digital prayer companion.</p>
      </footer>
    </div>
  );
}

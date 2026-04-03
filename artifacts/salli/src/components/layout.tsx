import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { BookOpen, Compass, Home, LayoutDashboard, Menu, X, User, LogOut, Users, HandHeart, Languages, MessageSquare, UserPlus, Inbox, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLogout, useGetNotificationsCount } from "@workspace/api-client-react";
import { useLanguage } from "@/contexts/language-context";
import { useSocialNotifications } from "@/hooks/use-social-notifications";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const logoutMutation = useLogout();
  const { t, language, setLanguage, isRTL } = useLanguage();

  const { data: notifCount } = useGetNotificationsCount({
    query: {
      enabled: isAuthenticated,
      refetchInterval: 30000,
    },
  });

  useSocialNotifications(
    notifCount?.pendingRequests ?? 0,
    notifCount?.unreadMessages ?? 0,
    isAuthenticated
  );

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

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "ar" : "en");
  };

  const navLinks = [
    { href: "/", label: t.nav.home, icon: Home },
    { href: "/prayer-times", label: language === "ar" ? "أوقات الصلاة" : "Prayer Times", icon: Clock },
    { href: "/dashboard", label: t.nav.dashboard, icon: LayoutDashboard },
    { href: "/community", label: t.nav.community, icon: Users },
    { href: "/doaas", label: t.nav.doaas, icon: HandHeart },
    { href: "/khushoo", label: t.nav.khushoo, icon: Compass },
    { href: "/motivation", label: t.nav.motivation, icon: BookOpen },
    { href: "/ai-chat", label: t.nav.aiChat, icon: MessageSquare },
  ];

  const socialLinks = isAuthenticated
    ? [
        {
          href: "/social",
          label: t.nav.social,
          icon: UserPlus,
          badge: notifCount?.pendingRequests || 0,
        },
        {
          href: "/messages",
          label: t.nav.messages,
          icon: Inbox,
          badge: notifCount?.unreadMessages || 0,
        },
      ]
    : [];

  return (
    <div className={cn("min-h-screen flex flex-col bg-background selection:bg-primary/20", isRTL && "font-arabic")} dir={isRTL ? "rtl" : "ltr"}>
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
                    "px-3 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-1.5",
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

            {socialLinks.map((link) => {
              const isActive = location.startsWith(link.href);
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "relative px-3 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-1.5",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                  {link.badge > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
                      {link.badge > 9 ? "9+" : link.badge}
                    </span>
                  )}
                </Link>
              );
            })}

            <div className="h-6 w-px bg-border mx-1"></div>

            <button
              onClick={toggleLanguage}
              title={language === "en" ? "Switch to Arabic" : "التبديل إلى الإنجليزية"}
              className="px-3 py-2 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-300 flex items-center gap-1.5"
            >
              <Languages className="w-4 h-4" />
              <span>{language === "en" ? "عربي" : "EN"}</span>
            </button>

            <div className="h-6 w-px bg-border mx-1"></div>

            {isAuthenticated && user ? (
              <>
                <Link
                  href="/profile"
                  className={cn(
                    "px-3 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-1.5",
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
                  className="px-3 py-2 rounded-full text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-300 flex items-center gap-1.5"
                  data-testid="button-logout"
                >
                  <LogOut className="w-4 h-4" />
                  {t.nav.logout}
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="px-3 py-2 rounded-full text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300"
                data-testid="link-login-nav"
              >
                {t.nav.login}
              </Link>
            )}
          </nav>

          {/* Mobile: language toggle + menu */}
          <div className="md:hidden flex items-center gap-2">
            {isAuthenticated && (notifCount?.pendingRequests || 0) + (notifCount?.unreadMessages || 0) > 0 && (
              <span className="w-2 h-2 rounded-full bg-destructive" />
            )}
            <button
              onClick={toggleLanguage}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors"
              title={language === "en" ? "Switch to Arabic" : "التبديل إلى الإنجليزية"}
            >
              <Languages className="w-5 h-5" />
            </button>
            <button
              className="p-2 text-foreground"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
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

          {socialLinks.map((link) => {
            const isActive = location.startsWith(link.href);
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
                {link.badge > 0 && (
                  <span className="ms-auto w-6 h-6 rounded-full bg-destructive text-destructive-foreground text-xs font-bold flex items-center justify-center">
                    {link.badge > 9 ? "9+" : link.badge}
                  </span>
                )}
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
                {t.nav.profile}
              </Link>
              <button
                onClick={handleLogout}
                className="p-4 rounded-xl text-base font-medium text-destructive hover:bg-destructive/10 transition-all flex items-center gap-3 text-left"
              >
                <LogOut className="w-5 h-5" />
                {t.nav.logout}
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="p-4 rounded-xl text-base font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-all text-center mt-2"
            >
              {t.nav.login}
            </Link>
          )}
        </nav>
      </div>

      <main className="flex-1 w-full max-w-5xl mx-auto p-4 md:p-6 lg:p-8 animate-in fade-in duration-500">
        {children}
      </main>

      <footer className="mt-auto py-8 border-t border-border/50 text-center text-sm text-muted-foreground">
        <p className="font-serif">Salli — {isRTL ? "رفيقك الرقمي للصلاة" : "Your digital prayer companion."}</p>
      </footer>
    </div>
  );
}

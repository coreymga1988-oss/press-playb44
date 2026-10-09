import { useState } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { Play, LayoutDashboard, Megaphone, BarChart3, Film, Users, Newspaper, CreditCard, LogOut, Menu, X, Crown, UserCircle, Ticket, Eye } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useCurrentUser } from "@/lib/useCurrentUser";
import { cn } from "@/lib/utils";
import Logo from "@/components/Logo";
import SocialLinks from "@/components/SocialLinks";
import NewsletterForm from "@/components/NewsletterForm";
import { Button } from "@/components/ui/button";
import SectionAccessGuard from "@/components/SectionAccessGuard";
import SuspendedScreen from "@/components/SuspendedScreen";
import { useSectionVisibility } from "@/lib/SectionVisibilityContext";
import { sectionKeyForPath } from "@/lib/sectionCatalog";

const NAV_BY_ROLE = {
  viewer: [
    { label: "Home", path: "/", icon: Play },
    { label: "Browse", path: "/series", icon: Film },
    { label: "News", path: "/feed", icon: Newspaper },
    { label: "Fund Projects", path: "/campaigns", icon: Crown },
    { label: "Account", path: "/account", icon: UserCircle },
  ],
  admin: [
    { label: "Dashboard", path: "/admin", icon: LayoutDashboard },
    { label: "Content", path: "/admin/content", icon: Film },
    { label: "Ad Approvals", path: "/admin/ads", icon: Megaphone },
    { label: "Finance", path: "/admin/finance", icon: CreditCard },
    { label: "Coupons", path: "/admin/coupons", icon: Ticket },
    { label: "Users", path: "/admin/users", icon: Users },
    { label: "Section Access", path: "/admin/section-visibility", icon: Eye },
    { label: "Account", path: "/account", icon: UserCircle },
  ],
  advertiser: [
    { label: "Dashboard", path: "/advertiser", icon: BarChart3 },
    { label: "My Ads", path: "/advertiser/ads", icon: Megaphone },
    { label: "Account", path: "/account", icon: UserCircle },
  ],
  licensor: [
    { label: "Performance", path: "/licensor", icon: BarChart3 },
    { label: "Revenue", path: "/licensor/revenue", icon: CreditCard },
    { label: "Account", path: "/account", icon: UserCircle },
  ],
};

export default function AppShell() {
  const { user, loading } = useCurrentUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const { isVisible } = useSectionVisibility();

  const role = user?.role || "viewer";
  const nav = NAV_BY_ROLE[role] || NAV_BY_ROLE.viewer;
  const isPremium = user?.subscription_tier === "premium";
  // Only the sections this audience is allowed to see appear in the navigation.
  const visibleNav = nav.filter((item) => {
    const key = sectionKeyForPath(item.path);
    return !key || isVisible(key);
  });

  const handleLogout = async () => {
    await base44.auth.logout();
    navigate("/login");
  };

  const roleLabel = role.charAt(0).toUpperCase() + role.slice(1);
  const initials = (user?.full_name || "U").split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();

  if (user?.suspended) return <SuspendedScreen />;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-40 glass border-b border-border">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Logo as="link" size={34} />

          <nav className="hidden md:flex items-center gap-1">
            {visibleNav.map((item) => {
              const Icon = item.icon;
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    active ? "bg-secondary text-foreground neon-border" : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            {user && role === "viewer" && !isPremium && (
              <Button asChild size="sm" className="hidden sm:flex neon-border bg-primary">
                <Link to="/checkout">
                  <Crown className="w-4 h-4 mr-1" /> Go Premium
                </Link>
              </Button>
            )}
            {!loading && user ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex flex-col items-end leading-tight">
                  <span className="text-sm font-semibold">{user.full_name || "User"}</span>
                  <span className="text-[11px] text-accent font-medium">{roleLabel}{isPremium ? " · Premium" : ""}</span>
                </div>
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent grid place-items-center text-xs font-bold text-background">
                  {initials}
                </div>
                <Button variant="ghost" size="icon" onClick={handleLogout} title="Sign out">
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Button asChild size="sm" variant="outline">
                <Link to="/login">Sign In</Link>
              </Button>
            )}
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setOpen((o) => !o)}>
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {open && (
          <nav className="md:hidden border-t border-border px-4 py-3 flex flex-col gap-1">
            {visibleNav.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-secondary"
                >
                  <Icon className="w-4 h-4" /> {item.label}
                </Link>
              );
            })}
          </nav>
        )}
      </header>

      <main className="flex-1">
        <SectionAccessGuard user={user}>
          <Outlet />
        </SectionAccessGuard>
      </main>

      <footer className="border-t border-border bg-card/40">
        <div className="max-w-7xl mx-auto px-4 py-10 space-y-6">
          <div className="flex flex-col items-center gap-4 text-center">
            <Logo size={32} withWordmark />
            <p className="text-sm text-muted-foreground max-w-md">Get updates on new dubs, episodes, crowdfunding projects, and exclusive offers.</p>
            <NewsletterForm />
          </div>
          <SocialLinks />
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-4 border-t border-border text-xs text-muted-foreground">
            <p>© {new Date().getFullYear()} Press Play International Media — Stream. Fund. Create.</p>
            <a href="https://pressplayanime.neocities.org" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">pressplayanime.neocities.org</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
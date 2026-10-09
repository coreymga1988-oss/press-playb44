import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { DollarSign, Users, Megaphone, Crown, Film, ChevronRight, Ticket, Copy, Trash2, Plus, Loader2, UserCheck, Eye } from "lucide-react";
import { base44 } from "@/api/base44Client";
import StatCard from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentUser } from "@/lib/useCurrentUser";
import { useToast } from "@/components/ui/use-toast";

const SITE = "https://pressplay-stream.base44.app";
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const genCode = () => Array.from({ length: 8 }, () => ALPHABET[Math.floor(Math.random() * ALPHABET.length)]).join("");
const INVITE_ROLES = ["advertiser", "licensor", "admin"];

export default function AdminDashboard() {
  const { user } = useCurrentUser();
  const { toast } = useToast();
  const [users, setUsers] = useState(null);
  const [campaigns, setCampaigns] = useState(null);
  const [ads, setAds] = useState(null);
  const [series, setSeries] = useState(null);
  const [invites, setInvites] = useState(null);
  const [iform, setIform] = useState({ email: "", role: "advertiser", expires_date: "" });
  const [genLoading, setGenLoading] = useState(false);

  const load = () => {
    base44.entities.User.list().then(setUsers).catch(() => setUsers([]));
    base44.entities.Crowdfunding_Campaigns.list().then(setCampaigns).catch(() => setCampaigns([]));
    base44.entities.Ads.list().then(setAds).catch(() => setAds([]));
    base44.entities.Content_Series.list().then(setSeries).catch(() => setSeries([]));
    base44.entities.Invite_Code.list("-created_date").then(setInvites).catch(() => setInvites([]));
  };
  useEffect(() => { load(); }, []);

  const premiumUsers = (users || []).filter((u) => u.subscription_tier === "premium");
  const mrr = premiumUsers.length * 8;
  const adRevenue = (ads || []).reduce((sum, a) => sum + (a.spend || 0), 0);
  const cfRaised = (campaigns || []).reduce((sum, c) => sum + (c.current_amount || 0), 0);
  const pendingAds = (ads || []).filter((a) => a.status === "pending").length;

  const quickLinks = [
    { label: "Manage Content", path: "/admin/content", icon: Film },
    { label: "Approve Ads", path: "/admin/ads", icon: Megaphone, badge: pendingAds },
    { label: "Users & Finance", path: "/admin/finance", icon: Users },
    { label: "Coupons", path: "/admin/coupons", icon: Ticket },
    { label: "Section Access", path: "/admin/section-visibility", icon: Eye },
  ];

  const generateInvite = async (e) => {
    e.preventDefault();
    if (!iform.email) return;
    setGenLoading(true);
    const code = genCode();
    try {
      await base44.entities.Invite_Code.create({
        code,
        email: iform.email.trim().toLowerCase(),
        role: iform.role,
        used: false,
        expires_date: iform.expires_date || null,
      });
      toast({ title: "Invitation created", description: `Code ${code} ready to share.` });
      setIform({ email: "", role: "advertiser", expires_date: "" });
      load();
    } catch (err) {
      toast({ title: "Could not create invite", description: err?.message || "", variant: "destructive" });
    }
    setGenLoading(false);
  };

  const copyLink = (code) => {
    const link = `${SITE}/register?invite=${code}`;
    navigator.clipboard?.writeText(link);
    toast({ title: "Registration link copied", description: link });
  };

  const activateInvite = async (inv) => {
    try {
      const all = await base44.entities.User.list();
      const u = (all || []).find((x) => (x.email || "").toLowerCase() === (inv.email || "").toLowerCase());
      if (!u) {
        toast({ title: "Not registered yet", description: `${inv.email} hasn't signed up with the invite link.`, variant: "destructive" });
        return;
      }
      await base44.entities.User.update(u.id, { role: inv.role });
      await base44.entities.Invite_Code.update(inv.id, { used: true, redeemed_by_id: u.id });
      toast({ title: "Activated", description: `${u.email} is now a ${inv.role}.` });
      load();
    } catch (err) {
      toast({ title: "Activation failed", description: err?.message || "", variant: "destructive" });
    }
  };

  const revokeInvite = async (inv) => {
    if (!window.confirm(`Revoke invite ${inv.code}?`)) return;
    try { await base44.entities.Invite_Code.delete(inv.id); toast({ title: "Invitation revoked" }); load(); }
    catch { toast({ title: "Could not revoke", variant: "destructive" }); }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Owner Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {user?.full_name || "Admin"}. Here's the platform at a glance.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {users ? <StatCard label="Subscription MRR" value={`$${mrr.toLocaleString()}`} icon={DollarSign} sub={`${premiumUsers.length} premium users`} /> : <Skeleton className="h-28 rounded-xl" />}
        {ads ? <StatCard label="Ad Revenue" value={`$${adRevenue.toLocaleString()}`} icon={Megaphone} accent="accent" sub={`${ads.length} total ads`} /> : <Skeleton className="h-28 rounded-xl" />}
        {campaigns ? <StatCard label="Crowdfunding Raised" value={`$${cfRaised.toLocaleString()}`} icon={Crown} accent="accent" sub={`${campaigns.length} campaigns`} /> : <Skeleton className="h-28 rounded-xl" />}
        {users ? <StatCard label="Total Users" value={users.length} icon={Users} sub={`${pendingAds} ads pending`} /> : <Skeleton className="h-28 rounded-xl" />}
      </div>

      {/* Invitations */}
      <div className="grid lg:grid-cols-2 gap-6">
        <form onSubmit={generateInvite} className="rounded-xl border border-border bg-card p-5 space-y-4">
          <h2 className="font-semibold flex items-center gap-2"><Ticket className="w-4 h-4 text-primary" /> Invite advertiser / licensor / admin</h2>
          <p className="text-sm text-muted-foreground -mt-2">Generates a one-time code tied to an email. Share the registration link — once the invitee signs up, click <span className="text-primary font-medium">Activate</span> to grant their role + dashboard.</p>
          <div className="space-y-1"><Label>Email</Label><Input type="email" value={iform.email} onChange={(e) => setIform({ ...iform, email: e.target.value })} placeholder="name@email.com" required /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1"><Label>Role</Label>
              <Select value={iform.role} onValueChange={(v) => setIform({ ...iform, role: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {INVITE_ROLES.map((r) => <SelectItem key={r} value={r} className="capitalize">{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1"><Label>Expires (optional)</Label><Input type="date" value={iform.expires_date} onChange={(e) => setIform({ ...iform, expires_date: e.target.value })} /></div>
          </div>
          <Button type="submit" disabled={genLoading} className="neon-border w-full">
            {genLoading ? <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> Generating</> : <><Plus className="w-4 h-4 mr-1" /> Generate invite code</>}
          </Button>
        </form>

        <div className="rounded-xl border border-border bg-card p-5 space-y-3">
          <h2 className="font-semibold">Pending & used invitations</h2>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {invites === null
              ? <Skeleton className="h-16 rounded-lg" />
              : invites.length === 0
              ? <p className="text-sm text-muted-foreground">No invitations yet.</p>
              : invites.map((inv) => (
                  <div key={inv.id} className="rounded-lg border border-border p-3 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-heading font-bold text-primary">{inv.code}</span>
                      <Badge variant="secondary" className="capitalize">{inv.role}</Badge>
                      {inv.used ? <Badge className="bg-secondary text-muted-foreground">Used</Badge> : <Badge className="bg-accent text-accent-foreground">Pending</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground">{inv.email}{inv.expires_date ? ` · expires ${inv.expires_date}` : ""}</p>
                    <div className="flex gap-2">
                      {!inv.used && <Button size="sm" className="neon-border flex-1" onClick={() => activateInvite(inv)}><UserCheck className="w-3.5 h-3.5 mr-1" /> Activate</Button>}
                      <Button size="sm" variant="outline" onClick={() => copyLink(inv.code)} title="Copy registration link"><Copy className="w-3.5 h-3.5" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => revokeInvite(inv)} title="Revoke"><Trash2 className="w-4 h-4 text-destructive" /></Button>
                    </div>
                  </div>
                ))}
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-3">Quick Actions</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickLinks.map((q) => {
            const Icon = q.icon;
            return (
              <Link key={q.path} to={q.path} className="group flex items-center justify-between p-4 rounded-xl border border-border bg-card hover:border-primary/60 hover:neon-border transition-all">
                <div className="flex items-center gap-3">
                  <span className="grid place-items-center w-10 h-10 rounded-lg bg-secondary text-primary"><Icon className="w-5 h-5" /></span>
                  <span className="font-semibold">{q.label}</span>
                  {q.badge ? <span className="ml-1 text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">{q.badge}</span> : null}
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
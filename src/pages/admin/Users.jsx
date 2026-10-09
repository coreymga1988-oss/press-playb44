import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Trash2, Ban, RotateCcw, Mail, Ticket } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";

const ROLES = ["viewer", "advertiser", "licensor", "admin"];
const TIERS = ["free", "premium"];

export default function Users() {
  const { toast } = useToast();
  const [users, setUsers] = useState(null);
  const [subscribers, setSubscribers] = useState(null);

  const load = () => {
    base44.entities.User.list().then(setUsers).catch(() => setUsers([]));
    base44.entities.Newsletter_Subscriber.list("-created_date").then(setSubscribers).catch(() => setSubscribers([]));
  };
  useEffect(() => { load(); }, []);

  const updateField = async (u, field, value, label) => {
    try {
      await base44.entities.User.update(u.id, { [field]: value });
      toast({ title: label });
      load();
    } catch (err) {
      toast({ title: "Update failed", description: err?.message || "", variant: "destructive" });
    }
  };

  const toggleSuspend = (u) => {
    updateField(u, "suspended", !u.suspended, u.suspended ? "Account reactivated" : "Account banned");
  };

  const remove = async (u) => {
    if (!window.confirm(`Delete ${u.email}? This permanently removes the account.`)) return;
    try {
      await base44.entities.User.delete(u.id);
      toast({ title: "User deleted" });
      load();
    } catch (err) {
      toast({ title: "Delete failed", description: err?.message || "", variant: "destructive" });
    }
  };

  const removeSubscriber = async (s) => {
    try { await base44.entities.Newsletter_Subscriber.delete(s.id); toast({ title: "Subscriber removed" }); load(); }
    catch { toast({ title: "Remove failed", variant: "destructive" }); }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
      <div>
        <h1 className="text-3xl font-heading font-bold">Users</h1>
        <p className="text-muted-foreground">Manage roles, ban or delete accounts, and change subscription tiers.</p>
      </div>

      <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 flex items-center gap-3">
        <Ticket className="w-5 h-5 text-primary shrink-0" />
        <p className="text-sm">
          Advertisers, licensors, and admins are <span className="font-semibold">invite-only</span>. Generate invite codes on the{" "}
          <Link to="/admin" className="text-primary font-medium hover:underline">Owner Dashboard</Link> and share the registration link.
        </p>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-3">All users</h2>
        <div className="rounded-xl border border-border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users === null
                ? Array.from({ length: 4 }).map((_, i) => (
                    <TableRow key={i}><TableCell colSpan={6}><Skeleton className="h-8 w-full" /></TableCell></TableRow>
                  ))
                : users.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.display_name || u.full_name || "—"}</TableCell>
                      <TableCell className="text-muted-foreground">{u.email || "—"}</TableCell>
                      <TableCell>
                        <Select value={u.role || "viewer"} onValueChange={(v) => updateField(u, "role", v, "Role updated")}>
                          <SelectTrigger className="w-32 h-8 capitalize"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {ROLES.map((r) => <SelectItem key={r} value={r} className="capitalize">{r}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select value={u.subscription_tier || "free"} onValueChange={(v) => updateField(u, "subscription_tier", v, "Tier updated")}>
                          <SelectTrigger className="w-28 h-8 capitalize"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {TIERS.map((t) => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        {u.suspended ? <Badge className="bg-destructive">Banned</Badge> : <Badge className="bg-secondary text-muted-foreground">Active</Badge>}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button size="icon" variant="ghost" title={u.suspended ? "Reactivate" : "Ban"} onClick={() => toggleSuspend(u)}>
                            {u.suspended ? <RotateCcw className="w-4 h-4 text-primary" /> : <Ban className="w-4 h-4 text-muted-foreground" />}
                          </Button>
                          <Button size="icon" variant="ghost" title="Delete" onClick={() => remove(u)}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Mailing list */}
      <div>
        <h2 className="text-xl font-bold mb-3 flex items-center gap-2"><Mail className="w-5 h-5 text-accent" /> Mailing list ({subscribers?.length || 0})</h2>
        <div className="rounded-xl border border-border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscribers === null
                ? <TableRow><TableCell colSpan={3}><Skeleton className="h-8 w-full" /></TableCell></TableRow>
                : subscribers.length === 0
                ? <TableRow><TableCell colSpan={3} className="text-muted-foreground">No subscribers yet.</TableCell></TableRow>
                : subscribers.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">{s.email}</TableCell>
                      <TableCell className="text-muted-foreground">{s.created_date ? new Date(s.created_date).toLocaleDateString() : "—"}</TableCell>
                      <TableCell className="text-right">
                        <Button size="icon" variant="ghost" title="Remove" onClick={() => removeSubscriber(s)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
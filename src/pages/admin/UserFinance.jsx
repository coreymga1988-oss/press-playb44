import { useEffect, useState } from "react";
import { Users, Ban } from "lucide-react";
import { base44 } from "@/api/base44Client";
import StatCard from "@/components/StatCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function UserFinance() {
  const [users, setUsers] = useState(null);
  const [series, setSeries] = useState(null);
  const [episodes, setEpisodes] = useState(null);

  useEffect(() => {
    base44.entities.User.list().then(setUsers).catch(() => setUsers([]));
    base44.entities.Content_Series.list().then(setSeries).catch(() => setSeries([]));
    base44.entities.Content_Episodes.list().then(setEpisodes).catch(() => setEpisodes([]));
  }, []);

  const mrr = (users || []).filter((u) => u.subscription_tier === "premium").length * 8;
  const licensors = (users || []).filter((u) => u.role === "licensor");

  // Revenue share pool: 50% of MRR goes to licensors, split by view count
  const totalViews = (episodes || []).reduce((s, e) => s + (e.view_count || 0), 0);
  const licensorPool = Math.round(mrr * 0.5);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
      <h1 className="text-3xl font-bold">Users & Finance</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Subscription MRR" value={`$${mrr}`} icon={Users} />
        <StatCard label="Total Users" value={users?.length || 0} icon={Users} />
        <StatCard label="Licensors" value={licensors.length} icon={Users} accent="accent" />
        <StatCard label="Licensor Payout Pool" value={`$${licensorPool}`} icon={Users} accent="accent" sub="50% of MRR" />
      </div>

      <div>
        <h2 className="text-xl font-bold mb-3">All Users</h2>
        <div className="rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Tier</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users === null
                ? Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i}><TableCell colSpan={4}><Skeleton className="h-8 w-full" /></TableCell></TableRow>
                  ))
                : users.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.full_name || "—"}</TableCell>
                      <TableCell className="text-muted-foreground">{u.email || "—"}</TableCell>
                      <TableCell><Badge variant="secondary">{u.role || "viewer"}</Badge></TableCell>
                      <TableCell>
                        <Badge className={u.subscription_tier === "premium" ? "bg-primary" : "bg-secondary text-muted-foreground"}>
                          {u.subscription_tier || "free"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-3">Licensor Payout Breakdown</h2>
        <div className="rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Licensor</TableHead>
                <TableHead>Series</TableHead>
                <TableHead>Total Views</TableHead>
                <TableHead>Est. Payout</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {licensors.length === 0 && (
                <TableRow><TableCell colSpan={4} className="text-muted-foreground">No licensor accounts.</TableCell></TableRow>
              )}
              {licensors.map((l) => {
                const licSeries = (series || []).filter((s) => s.licensor_id === l.id);
                const licViews = (episodes || [])
                  .filter((e) => licSeries.some((s) => s.id === e.series_id))
                  .reduce((sum, e) => sum + (e.view_count || 0), 0);
                const share = totalViews ? (licViews / totalViews) : 0;
                const payout = Math.round(licensorPool * share);
                return (
                  <TableRow key={l.id}>
                    <TableCell className="font-medium">{l.full_name}</TableCell>
                    <TableCell className="text-muted-foreground">{licSeries.map((s) => s.title).join(", ") || "—"}</TableCell>
                    <TableCell>{licViews.toLocaleString()}</TableCell>
                    <TableCell className="font-bold text-accent">${payout}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
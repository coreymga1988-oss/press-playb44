import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useCurrentUser } from "@/lib/useCurrentUser";
import StatCard from "@/components/StatCard";
import { DollarSign, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function LicensorRevenue() {
  const { user } = useCurrentUser();
  const [series, setSeries] = useState(null);
  const [episodes, setEpisodes] = useState(null);
  const [users, setUsers] = useState(null);

  useEffect(() => {
    base44.entities.Content_Series.filter({ licensor_id: user?.id || "none" }).then(setSeries).catch(() => setSeries([]));
    base44.entities.Content_Episodes.list().then(setEpisodes).catch(() => setEpisodes([]));
    base44.entities.User.list().then(setUsers).catch(() => setUsers([]));
  }, [user?.id]);

  // Licensor pool = 50% of total MRR; this licensor's share = their views / total platform views
  const myViews = (episodes || [])
    .filter((e) => (series || []).some((s) => s.id === e.series_id))
    .reduce((s, e) => s + (e.view_count || 0), 0);
  const platformViews = (episodes || []).reduce((s, e) => s + (e.view_count || 0), 0) || 1;
  const premiumCount = (users || []).filter((u) => u.subscription_tier === "premium").length;
  const mrr = premiumCount * 8;
  const pool = Math.round(mrr * 0.5);
  const share = myViews / platformViews;
  const payout = Math.round(pool * share);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Revenue Dashboard</h1>
        <p className="text-muted-foreground">Your calculated share based on viewership.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {episodes ? <StatCard label="Your Views" value={myViews.toLocaleString()} icon={TrendingUp} /> : <Skeleton className="h-28 rounded-xl" />}
        {users ? <StatCard label="Platform MRR" value={`$${mrr.toLocaleString()}`} icon={DollarSign} accent="accent" /> : <Skeleton className="h-28 rounded-xl" />}
        {users ? <StatCard label="Your Est. Payout" value={`$${payout.toLocaleString()}`} icon={DollarSign} accent="accent" sub={`${Math.round(share * 100)}% of pool`} /> : <Skeleton className="h-28 rounded-xl" />}
      </div>

      <div className="rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Series</TableHead>
              <TableHead>Views</TableHead>
              <TableHead>Share %</TableHead>
              <TableHead>Est. Revenue</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {series === null
              ? Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}><TableCell colSpan={4}><Skeleton className="h-8 w-full" /></TableCell></TableRow>
                ))
              : series.length === 0
              ? <TableRow><TableCell colSpan={4} className="text-muted-foreground">No series assigned to you.</TableCell></TableRow>
              : series.map((s) => {
                  const v = (episodes || []).filter((e) => e.series_id === s.id).reduce((sum, e) => sum + (e.view_count || 0), 0);
                  const sShare = v / platformViews;
                  return (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">{s.title}</TableCell>
                      <TableCell>{v.toLocaleString()}</TableCell>
                      <TableCell>{Math.round(sShare * 100)}%</TableCell>
                      <TableCell className="font-bold text-accent">${Math.round(pool * sShare)}</TableCell>
                    </TableRow>
                  );
                })}
          </TableBody>
        </Table>
      </div>
      <p className="text-xs text-muted-foreground">Payouts are calculated as 50% of subscription MRR, distributed by each series' share of total platform views.</p>
    </div>
  );
}
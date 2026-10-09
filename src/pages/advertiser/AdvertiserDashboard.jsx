import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";
import { base44 } from "@/api/base44Client";
import { useCurrentUser } from "@/lib/useCurrentUser";
import StatCard from "@/components/StatCard";
import { DollarSign, Eye, Megaphone } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function AdvertiserDashboard() {
  const { user } = useCurrentUser();
  const navigate = useNavigate();
  const [ads, setAds] = useState(null);

  useEffect(() => {
    base44.entities.Ads.filter({ advertiser_id: user?.id || "none" }).then(setAds).catch(() => setAds([]));
  }, [user?.id]);

  const totalSpend = (ads || []).reduce((s, a) => s + (a.spend || 0), 0);
  const totalDelivered = (ads || []).reduce((s, a) => s + (a.delivered_views || 0), 0);
  const totalTarget = (ads || []).reduce((s, a) => s + (a.target_views || 0), 0);
  const approved = (ads || []).filter((a) => a.status === "approved").length;

  const chartData = (ads || []).slice(0, 8).map((a) => ({ name: a.title?.slice(0, 14) || "Ad", delivered: a.delivered_views || 0, target: a.target_views || 0 }));

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Advertiser Analytics</h1>
          <p className="text-muted-foreground">Performance across all your campaigns.</p>
        </div>
        <Button onClick={() => navigate("/advertiser/ads")} className="neon-border"><Megaphone className="w-4 h-4 mr-1" /> Manage Ads</Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {ads ? <StatCard label="Total Spend" value={`$${totalSpend.toLocaleString()}`} icon={DollarSign} /> : <Skeleton className="h-28 rounded-xl" />}
        {ads ? <StatCard label="Views Delivered" value={totalDelivered.toLocaleString()} icon={Eye} accent="accent" /> : <Skeleton className="h-28 rounded-xl" />}
        {ads ? <StatCard label="Target Views" value={totalTarget.toLocaleString()} icon={Eye} /> : <Skeleton className="h-28 rounded-xl" />}
        {ads ? <StatCard label="Approved Ads" value={approved} icon={Megaphone} accent="accent" /> : <Skeleton className="h-28 rounded-xl" />}
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <h2 className="font-semibold mb-4">Delivery vs Target</h2>
        {ads && ads.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
              <Bar dataKey="target" fill="hsl(var(--secondary-foreground))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="delivered" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-muted-foreground text-center py-12">No ad data yet. <Link to="/advertiser/ads" className="text-accent underline">Create your first ad</Link>.</p>
        )}
      </div>
    </div>
  );
}
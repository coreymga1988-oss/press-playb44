import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { base44 } from "@/api/base44Client";
import { useCurrentUser } from "@/lib/useCurrentUser";
import StatCard from "@/components/StatCard";
import { Eye, Film, PlayCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import PartnerWithUs from "@/components/PartnerWithUs";

export default function LicensorDashboard() {
  const { user } = useCurrentUser();
  const [series, setSeries] = useState(null);
  const [episodes, setEpisodes] = useState(null);

  useEffect(() => {
    base44.entities.Content_Series.filter({ licensor_id: user?.id || "none" }).then(setSeries).catch(() => setSeries([]));
    base44.entities.Content_Episodes.list().then(setEpisodes).catch(() => setEpisodes([]));
  }, [user?.id]);

  const myEpisodes = (episodes || []).filter((e) => (series || []).some((s) => s.id === e.series_id));
  const totalViews = myEpisodes.reduce((s, e) => s + (e.view_count || 0), 0);

  const chartData = (series || []).map((s) => {
    const views = myEpisodes.filter((e) => e.series_id === s.id).reduce((sum, e) => sum + (e.view_count || 0), 0);
    return { name: s.title?.slice(0, 14) || "Series", views };
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Performance Dashboard</h1>
        <p className="text-muted-foreground">Analytics for the IP licensed to you.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {series ? <StatCard label="Licensed Series" value={series.length} icon={Film} /> : <Skeleton className="h-28 rounded-xl" />}
        {episodes ? <StatCard label="Total Episodes" value={myEpisodes.length} icon={PlayCircle} accent="accent" /> : <Skeleton className="h-28 rounded-xl" />}
        {episodes ? <StatCard label="Total Views" value={totalViews.toLocaleString()} icon={Eye} accent="accent" /> : <Skeleton className="h-28 rounded-xl" />}
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <h2 className="font-semibold mb-4">Views by Series</h2>
        {series && series.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
              <Bar dataKey="views" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-muted-foreground text-center py-12">No series assigned to your account yet.</p>
        )}
      </div>

      <div>
        <h2 className="text-xl font-bold mb-3">Episode Performance</h2>
        <div className="space-y-2">
          {myEpisodes.length === 0 && <p className="text-muted-foreground">No episodes available.</p>}
          {myEpisodes.map((ep) => (
            <div key={ep.id} className="flex items-center justify-between rounded-lg border border-border bg-card p-3">
              <div>
                <p className="font-medium">Ep {ep.episode_number || 1}: {ep.episode_title}</p>
                <p className="text-xs text-muted-foreground">{ep.series_title || ""}</p>
              </div>
              <span className="text-accent font-bold">{(ep.view_count || 0).toLocaleString()} views</span>
            </div>
          ))}
        </div>
      </div>

      <PartnerWithUs />
    </div>
  );
}
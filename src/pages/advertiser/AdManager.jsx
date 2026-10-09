import { useEffect, useState } from "react";
import { Megaphone, DollarSign, Eye, Plus, Trash2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useCurrentUser } from "@/lib/useCurrentUser";
import StatCard from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";

export default function AdManager() {
  const { user } = useCurrentUser();
  const { toast } = useToast();
  const [ads, setAds] = useState(null);
  const [form, setForm] = useState({ title: "", video_file: "", thumbnail: "", target_views: "", spend: "" });

  const load = () => {
    base44.entities.Ads.filter({ advertiser_id: user?.id || "none" }).then(setAds).catch(() => setAds([]));
  };
  useEffect(load, [user?.id]);

  const createAd = async (ev) => {
    ev.preventDefault();
    if (!form.title || !form.video_file || !form.target_views) return;
    await base44.entities.Ads.create({
      title: form.title,
      video_file: form.video_file,
      thumbnail: form.thumbnail,
      target_views: Number(form.target_views),
      spend: Number(form.spend) || 0,
      advertiser_id: user?.id,
      advertiser_name: user?.full_name,
      status: "pending",
    });
    setForm({ title: "", video_file: "", thumbnail: "", target_views: "", spend: "" });
    toast({ title: "Ad submitted for approval" });
    load();
  };

  const remove = async (id) => {
    await base44.entities.Ads.delete(id);
    load();
  };

  const totalSpend = (ads || []).reduce((s, a) => s + (a.spend || 0), 0);
  const totalDelivered = (ads || []).reduce((s, a) => s + (a.delivered_views || 0), 0);
  const totalTarget = (ads || []).reduce((s, a) => s + (a.target_views || 0), 0);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Ad Manager</h1>
        <p className="text-muted-foreground">Submit new ads and track delivery.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {ads ? <StatCard label="Total Ad Spend" value={`$${totalSpend.toLocaleString()}`} icon={DollarSign} /> : <Skeleton className="h-28 rounded-xl" />}
        {ads ? <StatCard label="Views Delivered" value={totalDelivered.toLocaleString()} icon={Eye} accent="accent" /> : <Skeleton className="h-28 rounded-xl" />}
        {ads ? <StatCard label="Target Views" value={totalTarget.toLocaleString()} icon={Megaphone} accent="accent" /> : <Skeleton className="h-28 rounded-xl" />}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <form onSubmit={createAd} className="rounded-xl border border-border bg-card p-5 space-y-3">
          <h2 className="font-semibold flex items-center gap-2"><Plus className="w-4 h-4" /> Upload New Ad</h2>
          <div className="space-y-1"><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></div>
          <div className="space-y-1"><Label>Video File URL</Label><Input value={form.video_file} onChange={(e) => setForm({ ...form, video_file: e.target.value })} placeholder="https://...mp4" required /></div>
          <div className="space-y-1"><Label>Thumbnail URL</Label><Input value={form.thumbnail} onChange={(e) => setForm({ ...form, thumbnail: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1"><Label>Target Views</Label><Input type="number" value={form.target_views} onChange={(e) => setForm({ ...form, target_views: e.target.value })} required /></div>
            <div className="space-y-1"><Label>Budget ($)</Label><Input type="number" value={form.spend} onChange={(e) => setForm({ ...form, spend: e.target.value })} /></div>
          </div>
          <Button type="submit" className="neon-border">Submit for Approval</Button>
        </form>

        <div className="space-y-3">
          <h2 className="font-semibold">My Ads</h2>
          {ads === null
            ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)
            : ads.length === 0
            ? <p className="text-muted-foreground">No ads yet. Submit one to get started.</p>
            : ads.map((ad) => {
                const pct = ad.target_views ? Math.min(100, Math.round((ad.delivered_views / ad.target_views) * 100)) : 0;
                return (
                  <div key={ad.id} className="rounded-xl border border-border bg-card p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{ad.title}</h3>
                        <span className="text-xs uppercase px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">{ad.status}</span>
                      </div>
                      <Button size="icon" variant="ghost" onClick={() => remove(ad.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                    </div>
                    <div className="mt-3">
                      <Progress value={pct} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1">{ad.delivered_views || 0} / {ad.target_views} views · ${ad.spend || 0}</p>
                    </div>
                  </div>
                );
              })}
        </div>
      </div>
    </div>
  );
}
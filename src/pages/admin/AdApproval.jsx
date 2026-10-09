import { useEffect, useState } from "react";
import { Megaphone, Check, X, ExternalLink, Mail, PlayCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Image } from "@/components/ui/image";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function AdApproval() {
  const { toast } = useToast();
  const [ads, setAds] = useState(null);
  const [users, setUsers] = useState([]);
  const [tab, setTab] = useState("pending");

  const load = async () => {
    const [a, u] = await Promise.all([
      base44.entities.Ads.list("-created_date").catch(() => []),
      base44.entities.User.list().catch(() => []),
    ]);
    setAds(a);
    setUsers(u);
  };
  useEffect(() => { load(); }, []);

  const setStatus = async (ad, status) => {
    try {
      await base44.entities.Ads.update(ad.id, { status });
      toast({ title: status === "approved" ? "Ad approved" : "Ad rejected" });
      load();
    } catch {
      toast({ title: "Update failed", variant: "destructive" });
    }
  };

  const filtered = (ads || []).filter((a) => (tab === "all" ? true : a.status === tab));
  const submitter = (ad) => users.find((u) => u.id === ad.advertiser_id);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <h1 className="text-3xl font-heading font-bold mb-1">Ad Approvals</h1>
      <p className="text-muted-foreground mb-6">Review full ad details and advertiser contact info before approving.</p>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>
        <TabsContent value={tab} className="mt-4">
          <div className="space-y-3">
            {ads === null
              ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-44 rounded-xl" />)
              : filtered.length === 0
              ? <p className="text-muted-foreground">No ads in this category.</p>
              : filtered.map((ad) => {
                  const u = submitter(ad);
                  return (
                    <div key={ad.id} className="rounded-xl border border-border bg-card p-4 flex flex-col md:flex-row gap-4">
                      <div className="md:w-48 shrink-0 aspect-video rounded-lg overflow-hidden bg-secondary">
                        {ad.thumbnail
                          ? <Image src={ad.thumbnail} alt={ad.title} className="w-full h-full" fittingType="fill" />
                          : <div className="w-full h-full grid place-items-center"><Megaphone className="w-8 h-8 text-muted-foreground" /></div>}
                      </div>
                      <div className="flex-1 space-y-2 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold">{ad.title}</h3>
                          <Badge className="uppercase">{ad.status}</Badge>
                        </div>
                        <div className="grid sm:grid-cols-3 gap-2 text-sm">
                          <div><span className="text-muted-foreground">Target views:</span> <span className="font-medium">{(ad.target_views || 0).toLocaleString()}</span></div>
                          <div><span className="text-muted-foreground">Delivered:</span> <span className="font-medium">{(ad.delivered_views || 0).toLocaleString()}</span></div>
                          <div><span className="text-muted-foreground">Budget:</span> <span className="font-medium">${ad.spend || 0}</span></div>
                        </div>
                        <div className="rounded-lg border border-border p-2 bg-secondary/30 text-sm">
                          <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Submitted by</p>
                          <p className="font-medium">{ad.advertiser_name || u?.full_name || u?.display_name || "—"}</p>
                          {u?.email
                            ? <a href={`mailto:${u.email}`} className="inline-flex items-center gap-1 text-primary hover:underline text-sm"><Mail className="w-3.5 h-3.5" /> {u.email}</a>
                            : <p className="text-muted-foreground text-sm">No contact on file (seeded sample ad).</p>}
                        </div>
                        {ad.video_file && (
                          <a href={ad.video_file} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
                            <PlayCircle className="w-4 h-4" /> Preview video <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                        {ad.status === "pending" && (
                          <div className="flex gap-2 pt-1">
                            <Button size="sm" onClick={() => setStatus(ad, "approved")} className="bg-accent text-accent-foreground hover:bg-accent/90"><Check className="w-4 h-4 mr-1" /> Approve</Button>
                            <Button size="sm" variant="outline" onClick={() => setStatus(ad, "rejected")}><X className="w-4 h-4 mr-1" /> Reject</Button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
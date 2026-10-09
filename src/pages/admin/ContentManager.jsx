import { useEffect, useState } from "react";
import { Film, Plus, Trash2, ListVideo, Newspaper, Pencil, X } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

const blankSeries = { title: "", description: "", cover_image: "", genre: "", status: "ongoing", licensor_id: "" };
const blankEpisode = { series_id: "", episode_number: "", episode_title: "", video_url: "", thumbnail: "" };
const blankNews = { title: "", content: "", image: "", author: "" };

export default function ContentManager() {
  const { toast } = useToast();
  const [series, setSeries] = useState([]);
  const [episodes, setEpisodes] = useState([]);
  const [news, setNews] = useState([]);
  const [licensors, setLicensors] = useState([]);

  const [sf, setSf] = useState(blankSeries);
  const [editingSeries, setEditingSeries] = useState(null);
  const [ef, setEf] = useState(blankEpisode);
  const [editingEpisode, setEditingEpisode] = useState(null);
  const [nf, setNf] = useState(blankNews);
  const [editingNews, setEditingNews] = useState(null);

  const load = async () => {
    const [s, e, n, u] = await Promise.all([
      base44.entities.Content_Series.list().catch(() => []),
      base44.entities.Content_Episodes.list().catch(() => []),
      base44.entities.News_Feed.list("-created_date").catch(() => []),
      base44.entities.User.list().catch(() => []),
    ]);
    setSeries(s);
    setEpisodes(e);
    setNews(n);
    setLicensors(u.filter((x) => x.role === "licensor"));
  };
  useEffect(() => { load(); }, []);

  const licName = (lic) => lic?.full_name || lic?.display_name || "";

  const submitSeries = async (ev) => {
    ev.preventDefault();
    if (!sf.title) return;
    const lic = licensors.find((l) => l.id === sf.licensor_id);
    const payload = { ...sf, licensor_name: licName(lic) };
    try {
      if (editingSeries) { await base44.entities.Content_Series.update(editingSeries, payload); toast({ title: "Series updated" }); }
      else { await base44.entities.Content_Series.create(payload); toast({ title: "Series created" }); }
      setSf(blankSeries); setEditingSeries(null); load();
    } catch {
      toast({ title: "Save failed", variant: "destructive" });
    }
  };

  const submitEpisode = async (ev) => {
    ev.preventDefault();
    if (!ef.series_id || !ef.episode_title) return;
    const s = series.find((x) => x.id === ef.series_id);
    const payload = { ...ef, episode_number: Number(ef.episode_number) || 1, series_title: s?.title || "" };
    try {
      if (editingEpisode) { await base44.entities.Content_Episodes.update(editingEpisode, payload); toast({ title: "Episode updated" }); }
      else { await base44.entities.Content_Episodes.create(payload); toast({ title: "Episode added" }); }
      setEf(blankEpisode); setEditingEpisode(null); load();
    } catch {
      toast({ title: "Save failed", variant: "destructive" });
    }
  };

  const submitNews = async (ev) => {
    ev.preventDefault();
    if (!nf.title || !nf.content) return;
    try {
      if (editingNews) { await base44.entities.News_Feed.update(editingNews, nf); toast({ title: "News updated" }); }
      else { await base44.entities.News_Feed.create(nf); toast({ title: "News posted" }); }
      setNf(blankNews); setEditingNews(null); load();
    } catch {
      toast({ title: "Save failed", variant: "destructive" });
    }
  };

  const editSeries = (s) => {
    setEditingSeries(s.id);
    setSf({ title: s.title || "", description: s.description || "", cover_image: s.cover_image || "", genre: s.genre || "", status: s.status || "ongoing", licensor_id: s.licensor_id || "" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const editEpisode = (ep) => {
    setEditingEpisode(ep.id);
    setEf({ series_id: ep.series_id || "", episode_number: String(ep.episode_number || ""), episode_title: ep.episode_title || "", video_url: ep.video_url || "", thumbnail: ep.thumbnail || "" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const editNews = (n) => {
    setEditingNews(n.id);
    setNf({ title: n.title || "", content: n.content || "", image: n.image || "", author: n.author || "" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const remove = async (entity, id) => {
    await base44.entities[entity].delete(id);
    toast({ title: "Deleted" });
    load();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-3xl font-heading font-bold mb-6">Content Manager</h1>
      <Tabs defaultValue="series">
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="series"><Film className="w-4 h-4 mr-1" /> Series</TabsTrigger>
          <TabsTrigger value="episodes"><ListVideo className="w-4 h-4 mr-1" /> Episodes</TabsTrigger>
          <TabsTrigger value="news"><Newspaper className="w-4 h-4 mr-1" /> News</TabsTrigger>
        </TabsList>

        {/* SERIES */}
        <TabsContent value="series" className="grid md:grid-cols-2 gap-6 mt-4">
          <form onSubmit={submitSeries} className="rounded-xl border border-border bg-card p-5 space-y-3">
            <h2 className="font-semibold flex items-center gap-2">
              {editingSeries ? <><Pencil className="w-4 h-4" /> Edit series</> : <><Plus className="w-4 h-4" /> New series</>}
            </h2>
            <div className="space-y-1"><Label>Title</Label><Input value={sf.title} onChange={(e) => setSf({ ...sf, title: e.target.value })} required /></div>
            <div className="space-y-1"><Label>Description</Label><Textarea value={sf.description} onChange={(e) => setSf({ ...sf, description: e.target.value })} /></div>
            <div className="space-y-1"><Label>Cover Image URL</Label><Input value={sf.cover_image} onChange={(e) => setSf({ ...sf, cover_image: e.target.value })} placeholder="https://..." /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><Label>Genre</Label><Input value={sf.genre} onChange={(e) => setSf({ ...sf, genre: e.target.value })} /></div>
              <div className="space-y-1"><Label>Status</Label>
                <Select value={sf.status} onValueChange={(v) => setSf({ ...sf, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ongoing">Ongoing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1"><Label>Assign Licensor</Label>
              <Select value={sf.licensor_id} onValueChange={(v) => setSf({ ...sf, licensor_id: v })}>
                <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                <SelectContent>
                  {licensors.map((l) => <SelectItem key={l.id} value={l.id}>{licName(l)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="neon-border">{editingSeries ? "Update series" : "Create series"}</Button>
              {editingSeries && <Button type="button" variant="outline" onClick={() => { setSf(blankSeries); setEditingSeries(null); }}>Cancel</Button>}
            </div>
          </form>

          <div className="space-y-2">
            <h2 className="font-semibold mb-2">Existing ({series.length})</h2>
            {series.map((s) => (
              <div key={s.id} className="flex items-center justify-between rounded-lg border border-border bg-card p-3">
                <div className="min-w-0">
                  <p className="font-medium truncate">{s.title}</p>
                  <p className="text-xs text-muted-foreground">{s.genre} · {s.licensor_name || "No licensor"}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button size="icon" variant="ghost" onClick={() => editSeries(s)}><Pencil className="w-4 h-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => remove("Content_Series", s.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                </div>
              </div>
            ))}
            {series.length === 0 && <p className="text-sm text-muted-foreground">No series yet.</p>}
          </div>
        </TabsContent>

        {/* EPISODES */}
        <TabsContent value="episodes" className="grid md:grid-cols-2 gap-6 mt-4">
          <form onSubmit={submitEpisode} className="rounded-xl border border-border bg-card p-5 space-y-3">
            <h2 className="font-semibold flex items-center gap-2">
              {editingEpisode ? <><Pencil className="w-4 h-4" /> Edit episode</> : <><Plus className="w-4 h-4" /> New episode</>}
            </h2>
            <div className="space-y-1"><Label>Series</Label>
              <Select value={ef.series_id} onValueChange={(v) => setEf({ ...ef, series_id: v })}>
                <SelectTrigger><SelectValue placeholder="Select series" /></SelectTrigger>
                <SelectContent>
                  {series.map((s) => <SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><Label>Episode #</Label><Input type="number" value={ef.episode_number} onChange={(e) => setEf({ ...ef, episode_number: e.target.value })} /></div>
              <div className="space-y-1"><Label>Episode Title</Label><Input value={ef.episode_title} onChange={(e) => setEf({ ...ef, episode_title: e.target.value })} required /></div>
            </div>
            <div className="space-y-1"><Label>Video URL</Label><Input value={ef.video_url} onChange={(e) => setEf({ ...ef, video_url: e.target.value })} placeholder="https://...mp4" /></div>
            <div className="space-y-1"><Label>Thumbnail URL</Label><Input value={ef.thumbnail} onChange={(e) => setEf({ ...ef, thumbnail: e.target.value })} /></div>
            <div className="flex gap-2">
              <Button type="submit" className="neon-border">{editingEpisode ? "Update episode" : "Add episode"}</Button>
              {editingEpisode && <Button type="button" variant="outline" onClick={() => { setEf(blankEpisode); setEditingEpisode(null); }}>Cancel</Button>}
            </div>
          </form>

          <div className="space-y-2">
            <h2 className="font-semibold mb-2">Existing ({episodes.length})</h2>
            {episodes.map((ep) => (
              <div key={ep.id} className="flex items-center justify-between rounded-lg border border-border bg-card p-3">
                <div className="min-w-0">
                  <p className="font-medium truncate">Ep {ep.episode_number || 1}: {ep.episode_title}</p>
                  <p className="text-xs text-muted-foreground">{ep.series_title || ""} · {ep.view_count || 0} views</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button size="icon" variant="ghost" onClick={() => editEpisode(ep)}><Pencil className="w-4 h-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => remove("Content_Episodes", ep.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                </div>
              </div>
            ))}
            {episodes.length === 0 && <p className="text-sm text-muted-foreground">No episodes yet.</p>}
          </div>
        </TabsContent>

        {/* NEWS */}
        <TabsContent value="news" className="grid md:grid-cols-2 gap-6 mt-4">
          <form onSubmit={submitNews} className="rounded-xl border border-border bg-card p-5 space-y-3">
            <h2 className="font-semibold flex items-center gap-2">
              {editingNews ? <><Pencil className="w-4 h-4" /> Edit post</> : <><Plus className="w-4 h-4" /> New post</>}
            </h2>
            <div className="space-y-1"><Label>Title</Label><Input value={nf.title} onChange={(e) => setNf({ ...nf, title: e.target.value })} required /></div>
            <div className="space-y-1"><Label>Content</Label><Textarea value={nf.content} onChange={(e) => setNf({ ...nf, content: e.target.value })} required /></div>
            <div className="space-y-1"><Label>Image URL</Label><Input value={nf.image} onChange={(e) => setNf({ ...nf, image: e.target.value })} /></div>
            <div className="space-y-1"><Label>Author</Label><Input value={nf.author} onChange={(e) => setNf({ ...nf, author: e.target.value })} /></div>
            <div className="flex gap-2">
              <Button type="submit" className="neon-border">{editingNews ? "Update post" : "Publish"}</Button>
              {editingNews && <Button type="button" variant="outline" onClick={() => { setNf(blankNews); setEditingNews(null); }}>Cancel</Button>}
            </div>
          </form>

          <div className="space-y-2">
            <h2 className="font-semibold mb-2">Published ({news.length})</h2>
            {news.map((n) => (
              <div key={n.id} className="flex items-center justify-between rounded-lg border border-border bg-card p-3">
                <div className="min-w-0">
                  <p className="font-medium truncate">{n.title}</p>
                  <p className="text-xs text-muted-foreground">{n.author || ""}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button size="icon" variant="ghost" onClick={() => editNews(n)}><Pencil className="w-4 h-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => remove("News_Feed", n.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                </div>
              </div>
            ))}
            {news.length === 0 && <p className="text-sm text-muted-foreground">No posts yet.</p>}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
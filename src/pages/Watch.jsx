import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Play, SkipForward, Crown, ListVideo } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useCurrentUser } from "@/lib/useCurrentUser";
import { Button } from "@/components/ui/button";
import { Image } from "@/components/ui/image";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";

const FALLBACK_VIDEO = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

export default function Watch() {
  const { id } = useParams();
  const { user } = useCurrentUser();
  const { toast } = useToast();
  const [series, setSeries] = useState(null);
  const [episodes, setEpisodes] = useState(null);
  const [activeEpisode, setActiveEpisode] = useState(null);
  const [ad, setAd] = useState(null);
  const [adPlaying, setAdPlaying] = useState(false);
  const [countdown, setCountdown] = useState(15);

  const isPremium = user?.subscription_tier === "premium";

  useEffect(() => {
    base44.entities.Content_Series.get(id).then(setSeries).catch(() => setSeries(null));
    base44.entities.Content_Episodes.filter({ series_id: id }).then(setEpisodes).catch(() => setEpisodes([]));
  }, [id]);

  useEffect(() => {
    if (episodes?.length) setActiveEpisode(episodes[0]);
  }, [episodes]);

  // Free users fetch an approved pre-roll ad
  useEffect(() => {
    if (isPremium) {
      setAd(null);
      setAdPlaying(false);
      return;
    }
    base44.entities.Ads.filter({ status: "approved" }).then((ads) => {
      if (ads.length) setAd(ads[0]);
    }).catch(() => {});
  }, [isPremium]);

  // Start ad when an episode is selected and user is free
  useEffect(() => {
    if (activeEpisode && !isPremium && ad) {
      setAdPlaying(true);
      setCountdown(15);
    } else {
      setAdPlaying(false);
    }
  }, [activeEpisode, isPremium, ad]);

  // Ad countdown / skip
  useEffect(() => {
    if (!adPlaying) return;
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [adPlaying, countdown]);

  const recordView = async (ep) => {
    try {
      await base44.entities.Content_Episodes.update(ep.id, { view_count: (ep.view_count || 0) + 1 });
      if (ad) {
        await base44.entities.Ads.update(ad.id, { delivered_views: (ad.delivered_views || 0) + 1 });
      }
    } catch (e) {
      /* ignore */
    }
  };

  const handleEpisodePlay = (ep) => {
    setActiveEpisode(ep);
    recordView(ep);
  };

  const skipAd = () => setAdPlaying(false);

  if (!series) return <div className="max-w-5xl mx-auto p-6"><Skeleton className="aspect-video w-full rounded-xl" /></div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <h1 className="text-2xl font-bold mb-1">{series.title}</h1>
        <p className="text-muted-foreground mb-4">{series.description}</p>

        <div className="rounded-xl overflow-hidden border border-border bg-black aspect-video relative">
          {adPlaying && ad ? (
            <div className="absolute inset-0">
              <video
                key={ad.id}
                src={ad.video_file || FALLBACK_VIDEO}
                autoPlay
                controls={false}
                className="w-full h-full object-contain"
                onEnded={skipAd}
              />
              <div className="absolute top-3 right-3 flex items-center gap-2">
                <span className="text-xs bg-black/70 px-2 py-1 rounded">Ad · {countdown}s</span>
                {countdown <= 0 && (
                  <Button size="sm" onClick={skipAd} className="neon-border">
                    <SkipForward className="w-4 h-4 mr-1" /> Skip
                  </Button>
                )}
              </div>
              <div className="absolute bottom-3 left-3 text-xs bg-black/70 px-2 py-1 rounded">Sponsored: {ad.title}</div>
            </div>
          ) : activeEpisode ? (
            <video
              key={activeEpisode.id}
              src={activeEpisode.video_url || FALLBACK_VIDEO}
              autoPlay
              controls
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="absolute inset-0 grid place-items-center text-muted-foreground">
              <div className="text-center">
                <Play className="w-12 h-12 mx-auto mb-2" />
                <p>Select an episode to begin</p>
              </div>
            </div>
          )}
        </div>

        {!isPremium && ad && !adPlaying && (
          <div className="mt-3 text-xs text-muted-foreground flex items-center gap-2">
            <Crown className="w-4 h-4 text-primary" /> You watched a pre-roll ad. Go Premium to skip ads forever.
            <Button asChild size="sm" variant="link" className="px-1">
              <Link to="/checkout">Upgrade</Link>
            </Button>
          </div>
        )}
        {activeEpisode && (
          <div className="mt-4">
            <h2 className="font-semibold">
              Ep {activeEpisode.episode_number || 1}: {activeEpisode.episode_title}
            </h2>
            <p className="text-sm text-muted-foreground">{activeEpisode.view_count || 0} views</p>
          </div>
        )}
      </div>

      <aside className="lg:col-span-1">
        <h3 className="font-semibold flex items-center gap-2 mb-3"><ListVideo className="w-5 h-5 text-accent" /> Episodes</h3>
        <div className="space-y-2">
          {episodes === null
            ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-lg" />)
            : episodes.length === 0
            ? <p className="text-sm text-muted-foreground">No episodes yet.</p>
            : episodes.map((ep) => (
                <button
                  key={ep.id}
                  onClick={() => handleEpisodePlay(ep)}
                  className={`w-full flex gap-3 p-2 rounded-lg text-left transition-colors ${activeEpisode?.id === ep.id ? "bg-secondary neon-border" : "hover:bg-secondary/60 border border-border"}`}
                >
                  <div className="w-24 aspect-video rounded overflow-hidden bg-secondary flex-shrink-0">
                    {ep.thumbnail ? <Image src={ep.thumbnail} alt={ep.episode_title} className="w-full h-full" fittingType="fill" /> : <div className="w-full h-full grid place-items-center"><Play className="w-5 h-5 text-muted-foreground" /></div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">Ep {ep.episode_number || 1}: {ep.episode_title}</p>
                    <p className="text-xs text-muted-foreground">{ep.view_count || 0} views</p>
                  </div>
                </button>
              ))}
        </div>
      </aside>
    </div>
  );
}
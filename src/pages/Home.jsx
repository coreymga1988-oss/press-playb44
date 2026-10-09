import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Play, Flame, Newspaper, ChevronRight, Crown } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useCurrentUser } from "@/lib/useCurrentUser";
import SeriesCard from "@/components/SeriesCard";
import CampaignCard from "@/components/CampaignCard";
import { Button } from "@/components/ui/button";
import { Image } from "@/components/ui/image";
import { Skeleton } from "@/components/ui/skeleton";
import ClosedBetaNotice from "@/components/ClosedBetaNotice";
import YouTubeFeed from "@/components/YouTubeFeed";
import SectionGate from "@/components/SectionGate";
import AboutPressPlay from "@/components/AboutPressPlay";
import PartnerWithUs from "@/components/PartnerWithUs";

export default function Home() {
  const { user } = useCurrentUser();
  const [series, setSeries] = useState(null);
  const [campaigns, setCampaigns] = useState(null);
  const [news, setNews] = useState(null);

  useEffect(() => {
    base44.entities.Content_Series.list("-created_date", 6).then(setSeries).catch(() => setSeries([]));
    base44.entities.Crowdfunding_Campaigns.list("-created_date", 3).then(setCampaigns).catch(() => setCampaigns([]));
    base44.entities.News_Feed.list("-created_date", 3).then(setNews).catch(() => setNews([]));
  }, []);

  const hero = series?.[0];
  const isFreeViewer = user?.role === "viewer" && user?.subscription_tier !== "premium";

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-12">
      {/* Hero */}
      <section className="relative rounded-2xl overflow-hidden border border-border min-h-[360px]">
        {hero ? (
          <>
            <Image src={hero.cover_image} alt={hero.title} className="absolute inset-0 w-full h-full" fittingType="fill" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/30" />
            <div className="relative p-8 md:p-12 flex flex-col justify-end min-h-[360px]">
              <span className="text-accent text-sm font-semibold flex items-center gap-1 mb-2"><Flame className="w-4 h-4" /> Featured Series</span>
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight neon-text">{hero.title}</h1>
              <p className="text-muted-foreground mt-3 max-w-xl line-clamp-2">{hero.description}</p>
              <div className="flex gap-3 mt-5">
                <Button asChild size="lg" className="neon-border">
                  <Link to={`/watch/${hero.id}`}><Play className="w-5 h-5 mr-2 fill-primary-foreground" /> Watch Now</Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link to="/series">Browse All</Link>
                </Button>
              </div>
            </div>
          </>
        ) : (
          <Skeleton className="w-full h-[360px]" />
        )}
      </section>

      {isFreeViewer && <ClosedBetaNotice />}

      {isFreeViewer && (
        <section className="rounded-2xl border border-primary/40 bg-gradient-to-r from-primary/15 to-accent/10 p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2"><Crown className="w-6 h-6 text-primary" /> Go Premium</h2>
            <p className="text-muted-foreground">No ads, pure streaming for just $8/month.</p>
          </div>
          <Button asChild size="lg" className="neon-border">
            <Link to="/checkout">Subscribe Now</Link>
          </Button>
        </section>
      )}

      <SectionGate sectionKey="home_youtube">
        <YouTubeFeed />
      </SectionGate>

      {/* Featured Series */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Trending Series</h2>
          <Link to="/series" className="text-accent text-sm flex items-center hover:underline">View all <ChevronRight className="w-4 h-4" /></Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {series
            ? series.map((s) => <SeriesCard key={s.id} series={s} />)
            : Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="aspect-[3/4] rounded-xl" />)}
        </div>
      </section>

      {/* Active Campaigns */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold flex items-center gap-2"><Crown className="w-6 h-6 text-accent" /> Active Campaigns</h2>
          <Link to="/campaigns" className="text-accent text-sm flex items-center hover:underline">View all <ChevronRight className="w-4 h-4" /></Link>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {campaigns
            ? campaigns.map((c) => <CampaignCard key={c.id} campaign={c} />)
            : Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-72 rounded-xl" />)}
        </div>
      </section>

      <SectionGate sectionKey="home_about">
        <AboutPressPlay />
      </SectionGate>

      <SectionGate sectionKey="home_partner">
        <PartnerWithUs />
      </SectionGate>

      {/* News Feed */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold flex items-center gap-2"><Newspaper className="w-6 h-6 text-accent" /> Latest News</h2>
          <Link to="/feed" className="text-accent text-sm flex items-center hover:underline">View all <ChevronRight className="w-4 h-4" /></Link>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {news
            ? news.map((n) => (
                <Link key={n.id} to="/feed" className="group rounded-xl overflow-hidden bg-card border border-border hover:border-accent/50 transition-colors">
                  {n.image && <Image src={n.image} alt={n.title} className="w-full aspect-video" fittingType="fill" />}
                  <div className="p-4">
                    <h3 className="font-semibold group-hover:text-accent transition-colors">{n.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{n.content}</p>
                  </div>
                </Link>
              ))
            : Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-56 rounded-xl" />)}
        </div>
      </section>
    </div>
  );
}
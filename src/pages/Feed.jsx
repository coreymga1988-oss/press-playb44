import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Image } from "@/components/ui/image";
import { Skeleton } from "@/components/ui/skeleton";

export default function Feed() {
  const [news, setNews] = useState(null);

  useEffect(() => {
    base44.entities.News_Feed.list("-created_date").then(setNews).catch(() => setNews([]));
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6">News Feed</h1>
      <div className="space-y-6">
        {news === null
          ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-64 rounded-xl" />)
          : news.length === 0
          ? <p className="text-muted-foreground">No news posts yet.</p>
          : news.map((n) => (
              <article key={n.id} className="rounded-xl overflow-hidden bg-card border border-border">
                {n.image && <Image src={n.image} alt={n.title} className="w-full aspect-video" fittingType="fill" />}
                <div className="p-5">
                  <p className="text-xs text-accent mb-1">{new Date(n.created_date).toLocaleDateString()}</p>
                  <h2 className="text-xl font-bold">{n.title}</h2>
                  {n.author && <p className="text-xs text-muted-foreground mb-2">by {n.author}</p>}
                  <p className="text-muted-foreground mt-2 whitespace-pre-line">{n.content}</p>
                </div>
              </article>
            ))}
      </div>
    </div>
  );
}
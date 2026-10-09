import { useState } from "react";
import { Play, Tv, ExternalLink } from "lucide-react";
import useYouTubeVideos from "@/hooks/useYouTubeVideos";
import { YOUTUBE_CHANNEL_URL } from "@/lib/youtube";
import { Image } from "@/components/ui/image";
import { Skeleton } from "@/components/ui/skeleton";

export default function YouTubeFeed() {
  const videos = useYouTubeVideos();
  const [activeId, setActiveId] = useState(null);
  const active = videos?.find((v) => v.id === activeId) || videos?.[0];

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Tv className="w-6 h-6 text-primary" /> From Our YouTube Channel
        </h2>
        <a
          href={YOUTUBE_CHANNEL_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent text-sm flex items-center gap-1 hover:underline"
        >
          Visit channel <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      {videos === null ? (
        <div className="grid md:grid-cols-3 gap-4">
          <Skeleton className="md:col-span-2 aspect-video rounded-xl" />
          <Skeleton className="aspect-video rounded-xl" />
        </div>
      ) : videos.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-6 text-center text-muted-foreground">
          Our videos live on YouTube right now —{" "}
          <a
            href={YOUTUBE_CHANNEL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline"
          >
            watch them on our channel
          </a>
          .
        </div>
      ) : (
        <>
          <div className="rounded-xl overflow-hidden border border-border bg-black">
            <div className="aspect-video">
              <iframe
                key={active.id}
                src={`${active.embed}?rel=0`}
                title={active.title}
                className="w-full h-full"
                referrerPolicy="strict-origin-when-cross-origin"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
          <p className="mt-2 font-medium line-clamp-1">{active.title}</p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-4">
            {videos.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setActiveId(v.id)}
                className={`group text-left rounded-lg overflow-hidden border transition-colors ${
                  active.id === v.id ? "border-primary" : "border-border hover:border-primary/50"
                }`}
              >
                <div className="relative">
                  <Image src={v.thumbnail} alt={v.title} className="w-full aspect-video" fittingType="fill" />
                  <span className="absolute inset-0 grid place-items-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="w-6 h-6 text-primary fill-primary" />
                  </span>
                </div>
                <p className="p-2 text-xs line-clamp-2">{v.title}</p>
              </button>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
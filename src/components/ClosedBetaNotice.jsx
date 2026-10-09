import { Rocket, ExternalLink } from "lucide-react";
import { YOUTUBE_CHANNEL_URL } from "@/lib/youtube";

export default function ClosedBetaNotice() {
  return (
    <section className="rounded-2xl border border-accent/40 bg-gradient-to-r from-accent/10 to-primary/10 p-6">
      <h2 className="text-xl font-bold flex items-center gap-2">
        <Rocket className="w-5 h-5 text-accent" /> We're in Closed Beta
      </h2>
      <p className="text-muted-foreground mt-2 max-w-3xl">
        Press Play Anime is still being built and tested, so the streaming library is limited while we license and
        prepare titles of our own. In the meantime, our latest videos are embedded below — pulled straight from our
        YouTube channel and updated automatically whenever we post something new.
      </p>
      <a
        href={YOUTUBE_CHANNEL_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-accent text-sm mt-3 hover:underline"
      >
        See everything on YouTube <ExternalLink className="w-4 h-4" />
      </a>
    </section>
  );
}
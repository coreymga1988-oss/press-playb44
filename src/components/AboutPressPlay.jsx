import { Users } from "lucide-react";

const SERVICES = [
  { title: "Localization & Subtitling", body: "Accurate, culturally-tuned English scripts and timed subtitles for anime and Japanese media." },
  { title: "Dubbing & Voice Casting", body: "Full English dub production, from casting through final mix." },
  { title: "Licensing & Distribution", body: "We license titles and bring them to English-speaking audiences across our streaming platform." },
  { title: "Crowdfunding & Fan Support", body: "Community-funded projects that let fans back the releases they want to see." },
];

export default function AboutPressPlay() {
  return (
    <section className="rounded-2xl border border-border bg-card p-6 md:p-8">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <Users className="w-6 h-6 text-primary" /> Who We Are
      </h2>
      <p className="text-muted-foreground mt-3 max-w-3xl">
        Press Play International Media is an independent anime localization and distribution studio. We translate,
        subtitle and dub anime for English-speaking audiences, and Press Play Anime is the streaming home we're building
        for the titles we license and produce.
      </p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {SERVICES.map((s) => (
          <div key={s.title} className="rounded-xl border border-border bg-background/50 p-4">
            <h3 className="font-semibold text-sm text-primary">{s.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{s.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
import { Link } from "react-router-dom";
import { Image } from "@/components/ui/image";
import { Badge } from "@/components/ui/badge";

export default function SeriesCard({ series }) {
  return (
    <Link to={`/watch/${series.id}`} className="group block rounded-xl overflow-hidden bg-card border border-border hover:border-primary/60 transition-all hover:neon-border">
      <div className="aspect-[3/4] overflow-hidden bg-secondary relative">
        <Image src={series.cover_image} alt={series.title} className="w-full h-full group-hover:scale-105 transition-transform duration-300" fittingType="fill" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
        <Badge className="absolute top-2 left-2 bg-primary/90 border-0">{series.status || "ongoing"}</Badge>
      </div>
      <div className="p-3">
        <h3 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">{series.title}</h3>
        {series.genre && <p className="text-xs text-muted-foreground mt-1">{series.genre}</p>}
      </div>
    </Link>
  );
}
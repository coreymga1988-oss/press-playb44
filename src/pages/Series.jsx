import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import SeriesCard from "@/components/SeriesCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function Series() {
  const [series, setSeries] = useState(null);
  const [q, setQ] = useState("");

  useEffect(() => {
    base44.entities.Content_Series.list().then(setSeries).catch(() => setSeries([]));
  }, []);

  const filtered = (series || []).filter((s) => s.title?.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6">Browse Series</h1>
      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search titles..." className="pl-9" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {series === null
          ? Array.from({ length: 12 }).map((_, i) => <Skeleton key={i} className="aspect-[3/4] rounded-xl" />)
          : filtered.map((s) => <SeriesCard key={s.id} series={s} />)}
      </div>
      {series?.length === 0 && <p className="text-muted-foreground">No series published yet.</p>}
    </div>
  );
}
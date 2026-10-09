import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import CampaignCard from "@/components/CampaignCard";
import { Skeleton } from "@/components/ui/skeleton";

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState(null);

  useEffect(() => {
    base44.entities.Crowdfunding_Campaigns.list("-created_date").then(setCampaigns).catch(() => setCampaigns([]));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6">Fund a Project</h1>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {campaigns === null
          ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-72 rounded-xl" />)
          : campaigns.length === 0
          ? <p className="text-muted-foreground">No active campaigns right now.</p>
          : campaigns.map((c) => <CampaignCard key={c.id} campaign={c} />)}
      </div>
    </div>
  );
}
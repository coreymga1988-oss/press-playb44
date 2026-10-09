import { Link } from "react-router-dom";
import { Image } from "@/components/ui/image";
import { Progress } from "@/components/ui/progress";

export default function CampaignCard({ campaign }) {
  const pct = campaign.goal_amount ? Math.min(100, Math.round((campaign.current_amount / campaign.goal_amount) * 100)) : 0;
  const daysLeft = campaign.end_date ? Math.max(0, Math.ceil((new Date(campaign.end_date) - new Date()) / 86400000)) : null;
  return (
    <Link to={`/campaigns/${campaign.id}`} className="group block rounded-xl overflow-hidden bg-card border border-border hover:border-accent/60 transition-all hover:neon-accent-glow">
      <div className="aspect-video overflow-hidden bg-secondary">
        <Image src={campaign.cover_image} alt={campaign.title} className="w-full h-full group-hover:scale-105 transition-transform duration-300" fittingType="fill" />
      </div>
      <div className="p-4">
        <h3 className="font-bold truncate group-hover:text-accent transition-colors">{campaign.title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{campaign.description}</p>
        <div className="mt-3">
          <Progress value={pct} className="h-2 progress-glow" />
          <div className="flex justify-between text-xs mt-1.5">
            <span className="font-bold text-accent">${(campaign.current_amount || 0).toLocaleString()}</span>
            <span className="text-muted-foreground">of ${(campaign.goal_amount || 0).toLocaleString()}</span>
          </div>
        </div>
        {daysLeft !== null && (
          <p className="text-xs text-muted-foreground mt-2">{daysLeft > 0 ? `${daysLeft} days left` : "Ended"}</p>
        )}
      </div>
    </Link>
  );
}
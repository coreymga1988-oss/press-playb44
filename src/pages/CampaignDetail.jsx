import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Crown, Check } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Image } from "@/components/ui/image";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";

function parseRewards(list) {
  if (!list) return [];
  try {
    const parsed = JSON.parse(list);
    if (Array.isArray(parsed)) return parsed;
  } catch (e) {
    /* fall through to text parsing */
  }
  return list
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const m = line.match(/^(.*?)\s*\$(\d+)\s*[-–—]?\s*(.*)$/);
      if (m) return { title: m[1].trim(), amount: parseInt(m[2], 10), desc: m[3].trim() };
      return { title: line, amount: 0, desc: "" };
    });
}

export default function CampaignDetail() {
  const { id } = useParams();
  const { toast } = useToast();
  const [campaign, setCampaign] = useState(null);
  const [selectedReward, setSelectedReward] = useState(null);
  const [pledging, setPledging] = useState(false);

  useEffect(() => {
    base44.entities.Crowdfunding_Campaigns.get(id).then(setCampaign).catch(() => setCampaign(null));
  }, [id]);

  const rewards = parseRewards(campaign?.rewards_list);
  const pct = campaign?.goal_amount ? Math.min(100, Math.round((campaign.current_amount / campaign.goal_amount) * 100)) : 0;
  const daysLeft = campaign?.end_date ? Math.max(0, Math.ceil((new Date(campaign.end_date) - new Date()) / 86400000)) : null;
  const pledgeAmount = selectedReward?.amount || 8;

  const handlePledge = async () => {
    setPledging(true);
    try {
      const updated = await base44.entities.Crowdfunding_Campaigns.update(id, {
        current_amount: (campaign.current_amount || 0) + pledgeAmount,
      });
      setCampaign(updated);
      toast({ title: "Pledge successful!", description: `Thank you for backing ${campaign.title}.` });
      setSelectedReward(null);
    } catch (e) {
      toast({ title: "Pledge failed", variant: "destructive" });
    } finally {
      setPledging(false);
    }
  };

  if (!campaign) return <div className="max-w-4xl mx-auto p-6"><Skeleton className="aspect-video w-full rounded-xl" /></div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-8">
      <div className="rounded-2xl overflow-hidden border border-border">
        <Image src={campaign.cover_image} alt={campaign.title} className="w-full aspect-[21/9]" fittingType="fill" />
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-4">
          <h1 className="text-4xl font-extrabold neon-text">{campaign.title}</h1>
          <p className="text-muted-foreground whitespace-pre-line">{campaign.description}</p>

          <div>
            <h2 className="text-xl font-bold mb-3 flex items-center gap-2"><Crown className="w-5 h-5 text-accent" /> Reward Tiers</h2>
            <div className="space-y-3">
              {rewards.length === 0 && <p className="text-sm text-muted-foreground">No reward tiers defined.</p>}
              {rewards.map((r, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedReward(r)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${selectedReward?.title === r.title ? "border-accent bg-accent/5 neon-accent-glow" : "border-border hover:border-accent/40 bg-card"}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{r.title}</h3>
                      {r.desc && <p className="text-sm text-muted-foreground mt-1">{r.desc}</p>}
                    </div>
                    <span className="font-bold text-accent">${r.amount || 0}</span>
                  </div>
                  {selectedReward?.title === r.title && <Check className="w-4 h-4 text-accent mt-2" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        <aside className="md:col-span-1">
          <div className="sticky top-20 rounded-xl border border-border bg-card p-5 space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-bold text-accent text-lg">${(campaign.current_amount || 0).toLocaleString()}</span>
                <span className="text-muted-foreground">of ${(campaign.goal_amount || 0).toLocaleString()}</span>
              </div>
              <Progress value={pct} className="h-2 progress-glow" />
              <p className="text-xs text-muted-foreground mt-1">{pct}% funded</p>
            </div>
            {daysLeft !== null && (
              <p className="text-sm">{daysLeft > 0 ? `${daysLeft} days to go` : "Campaign ended"}</p>
            )}
            <div className="pt-2 border-t border-border">
              <p className="text-sm text-muted-foreground mb-2">Your pledge</p>
              <p className="text-2xl font-bold text-primary mb-3">${pledgeAmount}</p>
              <Button onClick={handlePledge} disabled={pledging || daysLeft === 0} className="w-full neon-border">
                {pledging ? "Processing..." : daysLeft === 0 ? "Ended" : "Back this project"}
              </Button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
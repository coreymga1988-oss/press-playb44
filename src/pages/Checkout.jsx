import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Crown, Check, Lock, Loader2, Ticket, X } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useCurrentUser } from "@/lib/useCurrentUser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";

const BASE_PRICE = 8;
const PERKS = ["Ad-free streaming on all episodes", "Early access to new episodes", "Exclusive crowdfunding backer badges", "Support the creators directly"];

export default function Checkout() {
  const { user } = useCurrentUser();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [processing, setProcessing] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [coupon, setCoupon] = useState(null);
  const [checking, setChecking] = useState(false);

  const isPremium = user?.subscription_tier === "premium";

  const finalPrice = (() => {
    if (!coupon) return BASE_PRICE;
    if (coupon.discount_type === "percent") return Math.max(0, BASE_PRICE * (1 - coupon.discount_value / 100));
    return Math.max(0, BASE_PRICE - coupon.discount_value);
  })();
  const discount = BASE_PRICE - finalPrice;

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setChecking(true);
    try {
      const found = await base44.entities.Coupon.filter({ code: couponCode.trim().toUpperCase(), active: true });
      const c = found[0];
      if (!c) {
        toast({ title: "Invalid code", description: "This coupon isn't valid.", variant: "destructive" });
        setCoupon(null);
      } else if (c.expires_date && new Date(c.expires_date) < new Date()) {
        toast({ title: "Coupon expired", variant: "destructive" });
        setCoupon(null);
      } else if (c.max_uses && (c.used_count || 0) >= c.max_uses) {
        toast({ title: "Coupon used up", variant: "destructive" });
        setCoupon(null);
      } else {
        setCoupon(c);
        toast({ title: "Coupon applied", description: c.discount_type === "percent" ? `${c.discount_value}% off` : `$${c.discount_value} off` });
      }
    } catch {
      toast({ title: "Could not validate", variant: "destructive" });
    }
    setChecking(false);
  };

  const handleSubscribe = async () => {
    setProcessing(true);
    try {
      await base44.auth.updateMe({ subscription_tier: "premium" });
      if (coupon) {
        try { await base44.entities.Coupon.update(coupon.id, { used_count: (coupon.used_count || 0) + 1 }); } catch { /* ignore */ }
      }
      toast({ title: "Welcome to Premium!", description: "You now stream ad-free. Enjoy." });
      setTimeout(() => navigate("/"), 1200);
    } catch {
      toast({ title: "Subscription failed", description: "Please try again.", variant: "destructive" });
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <div className="inline-grid place-items-center w-16 h-16 rounded-2xl bg-primary neon-border mb-4">
          <Crown className="w-8 h-8 text-primary-foreground" />
        </div>
        <h1 className="text-4xl font-heading font-extrabold neon-text">Press Play Premium</h1>
        <p className="text-muted-foreground mt-2">Unlock the full experience for just ${BASE_PRICE}/month.</p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-6">
        <div className="flex items-baseline justify-center gap-2">
          {discount > 0 ? (
            <>
              <span className="text-2xl font-bold text-muted-foreground line-through">${BASE_PRICE}</span>
              <span className="text-5xl font-extrabold text-primary">${finalPrice.toFixed(2)}</span>
            </>
          ) : (
            <span className="text-5xl font-extrabold">${BASE_PRICE}</span>
          )}
          <span className="text-muted-foreground">/ month</span>
        </div>

        {/* Coupon */}
        <div className="space-y-2">
          <Label className="flex items-center gap-1.5"><Ticket className="w-4 h-4" /> Coupon or referral code</Label>
          {coupon ? (
            <div className="flex items-center justify-between rounded-lg border border-primary/50 bg-primary/10 p-3">
              <div className="flex items-center gap-2">
                <Badge className="bg-primary">{coupon.code}</Badge>
                <span className="text-sm">{coupon.discount_type === "percent" ? `${coupon.discount_value}% off` : `$${coupon.discount_value} off`}</span>
                {coupon.is_referral && <Badge variant="outline" className="text-accent border-accent/50">Referral</Badge>}
              </div>
              <Button size="sm" variant="ghost" onClick={() => { setCoupon(null); setCouponCode(""); }}><X className="w-4 h-4" /></Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Input value={couponCode} onChange={(e) => setCouponCode(e.target.value)} placeholder="Enter code" className="uppercase" />
              <Button type="button" variant="outline" onClick={applyCoupon} disabled={checking} className="shrink-0">
                {checking ? <Loader2 className="w-4 h-4 animate-spin" /> : "Apply"}
              </Button>
            </div>
          )}
        </div>

        <ul className="space-y-3">
          {PERKS.map((p) => (
            <li key={p} className="flex items-center gap-3">
              <span className="grid place-items-center w-6 h-6 rounded-full bg-accent/15 text-accent"><Check className="w-4 h-4" /></span>
              <span>{p}</span>
            </li>
          ))}
        </ul>

        {isPremium ? (
          <div className="rounded-xl border border-accent/40 bg-accent/10 p-4 text-center">
            <Check className="w-6 h-6 text-accent mx-auto mb-2" />
            <p className="font-semibold">You're already a Premium member.</p>
          </div>
        ) : (
          <Button onClick={handleSubscribe} disabled={processing} size="lg" className="w-full neon-border text-base">
            {processing ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Processing...</> : <><Lock className="w-4 h-4 mr-2" /> Subscribe{discount > 0 ? ` for $${finalPrice.toFixed(2)}` : ""}</>}
          </Button>
        )}
        <p className="text-xs text-center text-muted-foreground">Cancel anytime. Demo flow — no real card charged.</p>
      </div>
    </div>
  );
}
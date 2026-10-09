import { useState } from "react";
import { Mail, Loader2, Check } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

export default function NewsletterForm() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setBusy(true);
    try {
      await base44.entities.Newsletter_Subscriber.create({ email, source: "footer" });
      setDone(true);
      setEmail("");
      toast({ title: "You're on the list!", description: "Thanks for joining the mailing list." });
    } catch (err) {
      toast({ title: "Could not subscribe", description: err?.message || "Try again.", variant: "destructive" });
    }
    setBusy(false);
  };

  return (
    <form onSubmit={submit} className="w-full max-w-md mx-auto flex flex-col sm:flex-row gap-2">
      <div className="relative flex-1">
        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" required className="pl-9" />
      </div>
      <Button type="submit" disabled={busy || done} className="neon-border whitespace-nowrap">
        {busy ? <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> Joining</> : done ? <><Check className="w-4 h-4 mr-1" /> Subscribed</> : "Join mailing list"}
      </Button>
    </form>
  );
}
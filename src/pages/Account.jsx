import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Lock, Crown, Trash2, Loader2, Check, UserCircle, ShieldCheck, Camera } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useCurrentUser } from "@/lib/useCurrentUser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Image } from "@/components/ui/image";
import { useToast } from "@/components/ui/use-toast";

export default function Account() {
  const { user, loading } = useCurrentUser();
  const { toast } = useToast();
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [tier, setTier] = useState("free");
  const [savingName, setSavingName] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (user) {
      setDisplayName(user.display_name || user.full_name || "");
      setBio(user.bio || "");
      setAvatarUrl(user.avatar_url || "");
      setTier(user.subscription_tier || "free");
    }
  }, [user]);

  const saveProfile = async (e) => {
    e.preventDefault();
    setSavingName(true);
    try {
      await base44.auth.updateMe({ display_name: displayName, bio, avatar_url: avatarUrl });
      toast({ title: "Profile updated" });
    } catch {
      toast({ title: "Could not save", variant: "destructive" });
    }
    setSavingName(false);
  };

  const uploadAvatar = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadPublicFile({ file });
      setAvatarUrl(file_url);
      toast({ title: "Photo added", description: "Save your profile to keep it." });
    } catch {
      toast({ title: "Upload failed", variant: "destructive" });
    }
    setUploading(false);
  };

  const cancelPremium = async () => {
    setCanceling(true);
    try {
      await base44.auth.updateMe({ subscription_tier: "free" });
      setTier("free");
      toast({ title: "Premium canceled", description: "You're back on Free." });
    } catch {
      toast({ title: "Could not cancel", variant: "destructive" });
    }
    setCanceling(false);
  };

  const deleteAccount = async () => {
    if (!user) return;
    if (!window.confirm("Permanently delete your account and all your ads, series, and campaigns? This cannot be undone.")) return;
    setDeleting(true);
    try {
      await base44.entities.Ads.deleteMany({ advertiser_id: user.id });
      await base44.entities.Content_Series.deleteMany({ licensor_id: user.id });
      await base44.entities.Crowdfunding_Campaigns.deleteMany({ created_by_id: user.id });
      try {
        await base44.entities.User.delete(user.id);
        toast({ title: "Account deleted" });
      } catch {
        toast({ title: "Content removed", description: "Final account deletion requires an admin — contact support.", variant: "destructive" });
      }
      await base44.auth.logout();
      window.location.href = "/login";
    } catch {
      toast({ title: "Something went wrong", variant: "destructive" });
      setDeleting(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-40 rounded-xl" />
      </div>
    );
  }

  const roleLabel = (user.role || "viewer").charAt(0).toUpperCase() + (user.role || "viewer").slice(1);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-heading font-bold">Account</h1>
        <p className="text-muted-foreground">Manage your profile, subscription, and account.</p>
      </div>

      {/* Profile */}
      <form onSubmit={saveProfile} className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div className="flex items-center gap-2">
          <UserCircle className="w-5 h-5 text-primary" />
          <h2 className="font-semibold">Profile</h2>
        </div>
        <div className="flex items-center gap-4">
          {avatarUrl ? (
            <Image src={avatarUrl} alt={displayName || "Profile photo"} className="w-16 h-16 rounded-full overflow-hidden" fittingType="fill" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent grid place-items-center text-lg font-bold text-background">
              {(displayName || user.email || "U").slice(0, 2).toUpperCase()}
            </div>
          )}
          <div className="space-y-1">
            <Label htmlFor="avatar" className="cursor-pointer inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
              <Camera className="w-3.5 h-3.5" /> {uploading ? "Uploading…" : "Change photo"}
            </Label>
            <input id="avatar" type="file" accept="image/*" className="hidden" onChange={uploadAvatar} disabled={uploading} />
            {avatarUrl && (
              <button type="button" onClick={() => setAvatarUrl("")} className="block text-xs text-muted-foreground hover:text-destructive">
                Remove photo
              </button>
            )}
          </div>
        </div>
        <div className="space-y-1">
          <Label htmlFor="displayname">Display name</Label>
          <Input id="displayname" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your name" />
          <p className="text-xs text-muted-foreground">This is the name shown across the platform.</p>
        </div>
        <div className="space-y-1">
          <Label htmlFor="bio">About you</Label>
          <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell people a little about yourself" rows={3} />
        </div>
        <div className="space-y-1">
          <Label>Email address</Label>
          <div className="flex items-center gap-2 h-9 px-3 rounded-md border border-input bg-secondary/40 text-muted-foreground">
            <Mail className="w-4 h-4" />
            <span className="text-sm">{user.email || "—"}</span>
            <Badge variant="outline" className="ml-auto text-[10px]">Read-only</Badge>
          </div>
          <p className="text-xs text-muted-foreground">Email is managed by the secure login system.</p>
        </div>
        <div className="flex items-center justify-between">
          <Link to="/forgot-password" className="text-sm text-primary hover:underline inline-flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5" /> Change password
          </Link>
          <Button type="submit" disabled={savingName} className="neon-border">
            {savingName ? <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> Saving</> : "Save profile"}
          </Button>
        </div>
      </form>

      {/* Subscription */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Crown className="w-5 h-5 text-primary" />
          <h2 className="font-semibold">Subscription</h2>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Current plan</p>
            <Badge className={tier === "premium" ? "bg-primary" : "bg-secondary text-muted-foreground"}>
              {tier === "premium" ? "Premium" : "Free"}
            </Badge>
          </div>
          {tier === "premium" ? (
            <Button variant="outline" onClick={cancelPremium} disabled={canceling}>
              {canceling ? <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> Canceling</> : "Cancel Premium"}
            </Button>
          ) : (
            <Button asChild className="neon-border">
              <Link to="/checkout"><Crown className="w-4 h-4 mr-1" /> Upgrade to Premium</Link>
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5" />
          Real Stripe card billing requires a backend function + your Stripe keys — say the word and I'll wire it in.
        </p>
      </div>

      {/* Danger zone */}
      <div className="rounded-xl border border-destructive/40 bg-card p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Trash2 className="w-5 h-5 text-destructive" />
          <h2 className="font-semibold">Delete account</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Permanently delete your {roleLabel} account and all ads, series, and campaigns tied to you. This cannot be undone.
        </p>
        <Button variant="destructive" onClick={deleteAccount} disabled={deleting}>
          {deleting ? <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> Deleting</> : <><Trash2 className="w-4 h-4 mr-1" /> Delete my account</>}
        </Button>
      </div>
    </div>
  );
}
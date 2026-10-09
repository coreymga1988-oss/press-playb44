import { useEffect, useState } from "react";
import { Plus, Trash2, Pencil, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";

const blank = { code: "", description: "", discount_type: "percent", discount_value: "", is_referral: false, active: true, max_uses: "", expires_date: "" };

export default function Coupons() {
  const { toast } = useToast();
  const [coupons, setCoupons] = useState(null);
  const [form, setForm] = useState(blank);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () => base44.entities.Coupon.list("-created_date").then(setCoupons).catch(() => setCoupons([]));
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.code || !form.discount_value) return;
    setSaving(true);
    const payload = {
      code: form.code.toUpperCase().trim(),
      description: form.description,
      discount_type: form.discount_type,
      discount_value: Number(form.discount_value),
      is_referral: form.is_referral,
      active: form.active,
      max_uses: form.max_uses ? Number(form.max_uses) : null,
      expires_date: form.expires_date || null,
    };
    try {
      if (editingId) {
        await base44.entities.Coupon.update(editingId, payload);
        toast({ title: "Coupon updated" });
      } else {
        await base44.entities.Coupon.create({ ...payload, used_count: 0 });
        toast({ title: "Coupon created" });
      }
      setForm(blank); setEditingId(null); load();
    } catch (err) {
      toast({ title: "Save failed", description: err?.message || "", variant: "destructive" });
    }
    setSaving(false);
  };

  const edit = (c) => {
    setEditingId(c.id);
    setForm({
      code: c.code || "", description: c.description || "",
      discount_type: c.discount_type || "percent",
      discount_value: String(c.discount_value || ""),
      is_referral: !!c.is_referral, active: c.active !== false,
      max_uses: c.max_uses != null ? String(c.max_uses) : "",
      expires_date: c.expires_date || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const remove = async (c) => {
    if (!window.confirm(`Delete coupon ${c.code}?`)) return;
    try { await base44.entities.Coupon.delete(c.id); toast({ title: "Coupon deleted" }); load(); }
    catch { toast({ title: "Delete failed", variant: "destructive" }); }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-8">
      <div>
        <h1 className="text-3xl font-heading font-bold">Coupons & Referrals</h1>
        <p className="text-muted-foreground">Create discount and referral codes for Premium subscriptions.</p>
      </div>

      <form onSubmit={submit} className="rounded-xl border border-border bg-card p-5 space-y-4">
        <h2 className="font-semibold flex items-center gap-2">
          {editingId ? <><Pencil className="w-4 h-4" /> Edit coupon</> : <><Plus className="w-4 h-4" /> New coupon</>}
        </h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="space-y-1"><Label>Code</Label><Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="SUMMER25" required /></div>
          <div className="space-y-1"><Label>Description</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Summer 25% off" /></div>
          <div className="space-y-1"><Label>Discount type</Label>
            <Select value={form.discount_type} onValueChange={(v) => setForm({ ...form, discount_type: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="percent">Percent off</SelectItem>
                <SelectItem value="fixed">Fixed amount off</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1"><Label>Discount value {form.discount_type === "percent" ? "(%)" : "($)"}</Label><Input type="number" min="0" value={form.discount_value} onChange={(e) => setForm({ ...form, discount_value: e.target.value })} required /></div>
          <div className="space-y-1"><Label>Max uses (blank = unlimited)</Label><Input type="number" min="0" value={form.max_uses} onChange={(e) => setForm({ ...form, max_uses: e.target.value })} /></div>
          <div className="space-y-1"><Label>Expires (blank = never)</Label><Input type="date" value={form.expires_date} onChange={(e) => setForm({ ...form, expires_date: e.target.value })} /></div>
        </div>
        <div className="flex flex-wrap gap-6 pt-1">
          <label className="flex items-center gap-2 cursor-pointer"><Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} /> <span className="text-sm">Active</span></label>
          <label className="flex items-center gap-2 cursor-pointer"><Switch checked={form.is_referral} onCheckedChange={(v) => setForm({ ...form, is_referral: v })} /> <span className="text-sm">Referral code</span></label>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="submit" disabled={saving} className="neon-border">
            {saving ? <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> Saving</> : editingId ? "Update coupon" : "Create coupon"}
          </Button>
          {editingId && <Button type="button" variant="outline" onClick={() => { setForm(blank); setEditingId(null); }}>Cancel</Button>}
        </div>
      </form>

      <div>
        <h2 className="text-xl font-bold mb-3">All coupons</h2>
        <div className="space-y-2">
          {coupons === null
            ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-lg" />)
            : coupons.length === 0
            ? <p className="text-muted-foreground">No coupons yet.</p>
            : coupons.map((c) => (
                <div key={c.id} className="rounded-lg border border-border bg-card p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-heading font-bold text-primary">{c.code}</span>
                      {c.is_referral && <Badge className="bg-accent text-accent-foreground">Referral</Badge>}
                      {c.active === false && <Badge variant="outline">Inactive</Badge>}
                      <Badge variant="secondary">{c.discount_type === "percent" ? `${c.discount_value}% off` : `$${c.discount_value} off`}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{c.description || "—"} · Used {c.used_count || 0}{c.max_uses ? ` / ${c.max_uses}` : ""}{c.expires_date ? ` · expires ${c.expires_date}` : ""}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" onClick={() => edit(c)} title="Edit"><Pencil className="w-4 h-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => remove(c)} title="Delete"><Trash2 className="w-4 h-4 text-destructive" /></Button>
                  </div>
                </div>
              ))}
        </div>
      </div>
    </div>
  );
}
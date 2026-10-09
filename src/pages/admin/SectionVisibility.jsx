import { useEffect, useState } from "react";
import { Eye, LayoutGrid, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { AUDIENCES, SECTIONS } from "@/lib/sectionCatalog";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";

const GROUPS = [
  { kind: "page", title: "Site sections", icon: LayoutGrid, hint: "Pages people reach from the navigation." },
  { kind: "block", title: "Home page blocks", icon: Eye, hint: "Content blocks inside the home page." },
];

export default function SectionVisibility() {
  const { toast } = useToast();
  const [rows, setRows] = useState(null);
  const [saving, setSaving] = useState(null);

  useEffect(() => {
    base44.entities.Section_Visibility.list()
      .then((list) => setRows(Object.fromEntries((list || []).map((row) => [row.key, row]))))
      .catch(() => setRows({}));
  }, []);

  const valueFor = (section, audienceKey) => {
    const row = rows?.[section.key];
    return row ? row[audienceKey] === true : section[audienceKey] === true;
  };

  const toggle = async (section, audienceKey) => {
    const cell = `${section.key}.${audienceKey}`;
    const next = !valueFor(section, audienceKey);
    setSaving(cell);

    const payload = {
      key: section.key,
      label: section.label,
      path: section.path || "",
      kind: section.kind,
      order: section.order,
    };
    AUDIENCES.forEach((a) => {
      payload[a.key] = a.key === audienceKey ? next : valueFor(section, a.key);
    });

    try {
      const existing = rows?.[section.key];
      const saved = existing
        ? await base44.entities.Section_Visibility.update(existing.id, payload)
        : await base44.entities.Section_Visibility.create(payload);
      setRows((prev) => ({ ...prev, [section.key]: saved }));
    } catch (err) {
      toast({ title: "Could not save", description: err?.message || "", variant: "destructive" });
    }
    setSaving(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Eye className="w-7 h-7 text-primary" /> Section Access
        </h1>
        <p className="text-muted-foreground">
          Tick which parts of the site each audience can see. Owners always see everything.
        </p>
      </div>

      {GROUPS.map((group) => {
        const GroupIcon = group.icon;
        return (
          <section key={group.kind} className="space-y-4">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <GroupIcon className="w-5 h-5 text-accent" /> {group.title}
              </h2>
              <p className="text-sm text-muted-foreground">{group.hint}</p>
            </div>

            {rows === null ? (
              <div className="grid lg:grid-cols-2 gap-4">
                {Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)}
              </div>
            ) : (
              <div className="grid lg:grid-cols-2 gap-4">
                {SECTIONS.filter((s) => s.kind === group.kind).map((section) => (
                  <div key={section.key} className="rounded-xl border border-border bg-card p-5 space-y-4">
                    <div>
                      <h3 className="font-semibold">{section.label}</h3>
                      <p className="text-xs text-muted-foreground">{section.path || "Home page block"}</p>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {AUDIENCES.map((audience) => {
                        const locked = audience.key === "guest" && section.requiresLogin;
                        const cell = `${section.key}.${audience.key}`;
                        return (
                          <label
                            key={audience.key}
                            className={cn(
                              "flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2",
                              locked && "opacity-40"
                            )}
                          >
                            <span className="text-xs font-medium">{audience.label}</span>
                            <Switch
                              checked={valueFor(section, audience.key)}
                              disabled={locked || saving === cell}
                              onCheckedChange={() => toggle(section, audience.key)}
                              aria-label={`${section.label} — ${audience.label}`}
                            />
                          </label>
                        );
                      })}
                    </div>
                    {section.requiresLogin && (
                      <p className="text-xs text-muted-foreground">Requires a signed-in account — visitors are always sent to sign in.</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        );
      })}

      <p className="text-sm text-muted-foreground">
        "Not signed up" only reaches visitors when the app itself is set to be publicly viewable — otherwise everyone
        is asked to sign in first.
      </p>
    </div>
  );
}
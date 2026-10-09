import { cn } from "@/lib/utils";

export default function StatCard({ label, value, icon: Icon, accent = "primary", sub }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-3xl font-extrabold mt-1">{value}</p>
          {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
        </div>
        {Icon && (
          <span className={cn("grid place-items-center w-10 h-10 rounded-lg", accent === "primary" ? "bg-primary/15 text-primary" : "bg-accent/15 text-accent")}>
            <Icon className="w-5 h-5" />
          </span>
        )}
      </div>
    </div>
  );
}
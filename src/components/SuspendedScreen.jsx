import { ShieldAlert } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";

export default function SuspendedScreen() {
  return (
    <div className="min-h-screen grid place-items-center px-4">
      <div className="max-w-md text-center space-y-4 rounded-2xl border border-border bg-card p-8">
        <ShieldAlert className="w-10 h-10 text-destructive mx-auto" />
        <h1 className="text-2xl font-heading font-bold">Account Suspended</h1>
        <p className="text-muted-foreground">Your account has been suspended by an administrator. Please contact support.</p>
        <Button variant="outline" onClick={() => base44.auth.logout()}>Sign out</Button>
      </div>
    </div>
  );
}
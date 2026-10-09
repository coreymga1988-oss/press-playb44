import { Globe, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { COMPANY_SITE_URL } from "@/lib/youtube";

export default function PartnerWithUs() {
  return (
    <section className="rounded-2xl border border-primary/40 bg-gradient-to-r from-primary/10 to-accent/5 p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Globe className="w-6 h-6 text-primary" /> Licensors &amp; Studios — Partner With Us
        </h2>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Looking for localization for your titles? We'd love to hear from you. Visit our company website to learn more
          about what we do and get in touch about a partnership.
        </p>
      </div>
      <Button asChild size="lg" className="neon-border shrink-0">
        <a href={COMPANY_SITE_URL} target="_blank" rel="noopener noreferrer">
          Visit Our Website <ExternalLink className="w-4 h-4 ml-2" />
        </a>
      </Button>
    </section>
  );
}
import { useId } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

/**
 * Press Play International Media brand mark — hexagonal play button
 * with a green gradient, modeled on pressplayanime.neocities.org.
 */
export default function Logo({ size = 36, withWordmark = true, as = "span", className }) {
  const raw = useId().replace(/:/g, "");
  const gid = `ppg-${raw}`;
  const fid = `ppglow-${raw}`;
  const Comp = as === "link" ? Link : "span";
  const linkProps = as === "link" ? { to: "/" } : {};

  return (
    <Comp {...linkProps} className={cn("flex items-center gap-2.5 group", className)}>
      <svg viewBox="0 0 160 160" width={size} height={size} className="shrink-0" aria-label="Press Play" role="img">
        <defs>
          <linearGradient id={gid} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2bdc70" />
            <stop offset="100%" stopColor="#7fff5f" />
          </linearGradient>
          <filter id={fid} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <polygon points="80,80 100,46 136,46 156,80 136,114 100,114" fill="none" stroke={`url(#${gid})`} strokeWidth="1.2" opacity="0.4" />
        <polygon points="80,80 97,51 123,51 140,80 123,109 97,109" fill="rgba(43,220,112,0.06)" stroke={`url(#${gid})`} strokeWidth="1.8" />
        <polygon points="96,64 96,96 128,80" fill={`url(#${gid})`} filter={`url(#${fid})`} />
        <circle cx="118" cy="80" r="3" fill="#7fff5f" opacity="0.6" />
      </svg>
      {withWordmark && (
        <span className="flex flex-col leading-none">
          <span className="font-heading font-extrabold tracking-tight text-lg">
            <span className="text-foreground">PRESS</span>
            <span className="text-primary neon-text">PLAY</span>
          </span>
          <span className="text-[8px] tracking-[0.28em] text-muted-foreground font-normal mt-0.5">INTERNATIONAL MEDIA</span>
        </span>
      )}
    </Comp>
  );
}
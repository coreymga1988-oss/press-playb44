// Press Play International Media — social links.
// Logos served from the Simple Icons CDN, tinted to the site's primary green
// (#2bdc70) with a matching glow. Casting Call Club isn't in Simple Icons, so
// it uses an inline microphone mark.
const GREEN = "2bdc70";
const logo = (slug) => `https://cdn.simpleicons.org/${slug}/${GREEN}`;
const GLOW = "drop-shadow-[0_0_4px_rgba(43,220,112,0.4)]";

const LINKS = [
  { label: "YouTube", href: "https://www.youtube.com/channel/UCEXmgoj7TLrTb1OJtkgTAxw", icon: logo("youtube") },
  { label: "Discord", href: "https://discord.gg/qv8tD653D3", icon: logo("discord") },
  { label: "Kickstarter", href: "https://www.kickstarter.com/profile/pressplayintlmedia", icon: logo("kickstarter") },
  { label: "BlueSky", href: "https://bsky.app/profile/pressplay-anime.bsky.social", icon: logo("bluesky") },
  { label: "X / Twitter", href: "https://x.com/pressplay_intl", icon: logo("x") },
  { label: "Instagram", href: "https://www.instagram.com/pressplay_anime/", icon: logo("instagram") },
  { label: "TikTok", href: "https://www.tiktok.com/@pressplay_anime", icon: logo("tiktok") },
  { label: "Twitch", href: "https://www.twitch.tv/pressplay_anime", icon: logo("twitch") },
  { label: "Kick", href: "https://kick.com/pressplay-anime", icon: logo("kick") },
  { label: "Dailymotion", href: "https://www.dailymotion.com/user/pressplay_anime", icon: logo("dailymotion") },
  { label: "Casting Call Club", href: "https://www.castingcall.club/pressplay_anime", mic: true },
];

function MicMark() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="#2bdc70" className={GLOW} aria-hidden="true">
      <path d="M12 1a4 4 0 0 1 4 4v6a4 4 0 0 1-8 0V5a4 4 0 0 1 4-4zm0 2a2 2 0 0 0-2 2v6a2 2 0 0 0 4 0V5a2 2 0 0 0-2-2zm7 7a1 1 0 0 1 1 1 8 8 0 0 1-7 7.93V21h2a1 1 0 0 1 0 2H9a1 1 0 0 1 0-2h2v-2.07A8 8 0 0 1 4 11a1 1 0 0 1 2 0 6 6 0 0 0 12 0 1 1 0 0 1 1-1z" />
    </svg>
  );
}

export default function SocialLinks({ className = "" }) {
  return (
    <div className={`flex items-center justify-center gap-2 flex-wrap ${className}`}>
      {LINKS.map((l) => (
        <a
          key={l.label}
          href={l.href}
          target="_blank"
          rel="noopener noreferrer"
          title={l.label}
          aria-label={l.label}
          className="grid place-items-center w-10 h-10 rounded-full border border-border bg-card hover:border-primary/50 transition-colors"
        >
          {l.mic ? (
            <MicMark />
          ) : (
            <img
              src={l.icon}
              alt=""
              width="20"
              height="20"
              loading="lazy"
              className={`w-5 h-5 ${GLOW}`}
            />
          )}
        </a>
      ))}
    </div>
  );
}
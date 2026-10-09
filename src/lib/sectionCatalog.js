// Single source of truth for which parts of the site each audience may see.
// The admin "Section Access" screen writes overrides to the Section_Visibility
// entity; these values are the defaults used until an admin saves their own
// choices (and for anyone the entity can't be read for).

// The audiences an admin can tailor content for. Admins always see everything
// so the panel can never lock itself out.
export const AUDIENCES = [
  { key: "guest", label: "Not signed up" },
  { key: "viewer_free", label: "Free viewers" },
  { key: "viewer_premium", label: "Premium viewers" },
  { key: "licensor", label: "Licensors" },
  { key: "advertiser", label: "Advertisers" },
];

// `requiresLogin` sections can never be opened to visitors without an account.
export const SECTIONS = [
  {
    key: "home", label: "Home", path: "/", kind: "page", order: 1, requiresLogin: false,
    guest: true, viewer_free: true, viewer_premium: true, licensor: false, advertiser: false,
  },
  {
    key: "series", label: "Browse Series", path: "/series", kind: "page", order: 2, requiresLogin: false,
    guest: true, viewer_free: true, viewer_premium: true, licensor: false, advertiser: false,
  },
  {
    key: "feed", label: "News & Updates", path: "/feed", kind: "page", order: 3, requiresLogin: false,
    guest: true, viewer_free: true, viewer_premium: true, licensor: false, advertiser: false,
  },
  {
    key: "campaigns", label: "Fund Projects", path: "/campaigns", kind: "page", order: 4, requiresLogin: false,
    guest: true, viewer_free: true, viewer_premium: true, licensor: false, advertiser: false,
  },
  {
    key: "watch", label: "Episode Player", path: "/watch", kind: "page", order: 5, requiresLogin: true,
    guest: false, viewer_free: true, viewer_premium: true, licensor: false, advertiser: false,
  },
  {
    key: "checkout", label: "Premium Checkout", path: "/checkout", kind: "page", order: 6, requiresLogin: true,
    guest: false, viewer_free: true, viewer_premium: true, licensor: false, advertiser: false,
  },
  {
    key: "home_youtube", label: "YouTube Channel Feed", path: "", kind: "block", order: 7, requiresLogin: false,
    guest: true, viewer_free: true, viewer_premium: true, licensor: true, advertiser: true,
  },
  {
    key: "home_about", label: "About Press Play", path: "", kind: "block", order: 8, requiresLogin: false,
    guest: true, viewer_free: true, viewer_premium: true, licensor: true, advertiser: true,
  },
  {
    key: "home_partner", label: "Partner With Us", path: "", kind: "block", order: 9, requiresLogin: false,
    guest: true, viewer_free: true, viewer_premium: true, licensor: true, advertiser: true,
  },
];

export const SECTION_BY_KEY = Object.fromEntries(SECTIONS.map((s) => [s.key, s]));

export const ROLE_HOME = {
  viewer: "/",
  advertiser: "/advertiser",
  licensor: "/licensor",
  admin: "/admin",
};

// Which of the five audiences the signed-in user belongs to.
export function audienceForUser(user) {
  if (!user) return "guest";
  if (user.role === "admin") return "admin";
  if (user.role === "licensor") return "licensor";
  if (user.role === "advertiser") return "advertiser";
  return user.subscription_tier === "premium" ? "viewer_premium" : "viewer_free";
}

export function isSectionVisible(section, audience) {
  if (audience === "admin") return true;
  if (!section) return true;
  return section[audience] === true;
}

// Longest matching section path for a URL, so "/campaigns/abc" maps to the
// "campaigns" section and "/watch/xyz" to "watch".
export function sectionKeyForPath(pathname) {
  let match = null;
  for (const section of SECTIONS) {
    if (section.kind !== "page" || !section.path) continue;
    const hit = pathname === section.path || (section.path !== "/" && pathname.startsWith(section.path + "/"));
    if (hit && (!match || section.path.length > match.path.length)) match = section;
  }
  return match?.key || null;
}
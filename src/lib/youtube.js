// Press Play International Media — public links.
export const COMPANY_SITE_URL = "https://pressplayanime.neocities.org/";
export const YOUTUBE_CHANNEL_ID = "UCEXmgoj7TLrTb1OJtkgTAxw";
export const YOUTUBE_CHANNEL_URL = "https://www.youtube.com/@pressplay_anime/videos";

const RSS_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${YOUTUBE_CHANNEL_ID}`;

const idFromUrl = (url) => {
  const m = url?.match(/[?&]v=([\w-]{6,})/);
  return m ? m[1] : null;
};

const build = (rows) =>
  rows
    .filter((r) => r.id)
    .map((r) => ({
      id: r.id,
      title: r.title || "Untitled video",
      published: r.published || null,
      thumbnail: `https://i.ytimg.com/vi/${r.id}/hqdefault.jpg`,
      url: `https://www.youtube.com/watch?v=${r.id}`,
      embed: `https://www.youtube.com/embed/${r.id}`,
    }));

async function viaRss2Json() {
  const res = await fetch(
    `https://api.rss2json.com/v1/api.json?count=50&rss_url=${encodeURIComponent(RSS_URL)}`
  );
  if (!res.ok) throw new Error("rss2json unavailable");
  const data = await res.json();
  if (data.status !== "ok" || !Array.isArray(data.items)) throw new Error("rss2json unavailable");
  const videos = build(
    data.items.map((it) => ({
      id: idFromUrl(it.link) || (it.guid || "").split(":").pop(),
      title: it.title,
      published: it.pubDate,
    }))
  );
  if (!videos.length) throw new Error("rss2json returned no videos");
  return videos;
}

async function viaProxy() {
  const res = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(RSS_URL)}`);
  if (!res.ok) throw new Error("proxy unavailable");
  const doc = new DOMParser().parseFromString(await res.text(), "text/xml");
  const entries = Array.from(doc.getElementsByTagName("entry"));
  const videos = build(
    entries.map((e) => ({
      id: idFromUrl(e.getElementsByTagName("link")[0]?.getAttribute("href")),
      title: e.getElementsByTagName("title")[0]?.textContent,
      published: e.getElementsByTagName("published")[0]?.textContent,
    }))
  );
  if (!videos.length) throw new Error("proxy returned no videos");
  return videos;
}

// Pulls the channel's videos straight from its public feed, so new uploads
// appear automatically without any manual updates.
export async function fetchChannelVideos() {
  try {
    return await viaRss2Json();
  } catch {
    return await viaProxy();
  }
}
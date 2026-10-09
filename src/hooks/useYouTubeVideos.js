import { useEffect, useState } from "react";
import { fetchChannelVideos } from "@/lib/youtube";

// null = still loading, [] = nothing available
export default function useYouTubeVideos() {
  const [videos, setVideos] = useState(null);

  useEffect(() => {
    let active = true;
    fetchChannelVideos()
      .then((v) => active && setVideos(v))
      .catch(() => active && setVideos([]));
    return () => {
      active = false;
    };
  }, []);

  return videos;
}
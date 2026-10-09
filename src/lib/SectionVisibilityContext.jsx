import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { SECTIONS, audienceForUser, isSectionVisible } from "@/lib/sectionCatalog";

const SectionVisibilityContext = createContext(null);

// Loads the admin's saved visibility choices once and exposes them to every
// screen, merged over the built-in defaults.
export function SectionVisibilityProvider({ user, children }) {
  const [records, setRecords] = useState(null);

  useEffect(() => {
    let active = true;
    base44.entities.Section_Visibility.list()
      .then((rows) => active && setRecords(rows || []))
      .catch(() => active && setRecords([]));
    return () => {
      active = false;
    };
  }, []);

  const value = useMemo(() => {
    const saved = new Map((records || []).map((row) => [row.key, row]));
    const sections = SECTIONS.map((section) => {
      const row = saved.get(section.key);
      if (!row) return section;
      return {
        ...section,
        guest: row.guest ?? section.guest,
        viewer_free: row.viewer_free ?? section.viewer_free,
        viewer_premium: row.viewer_premium ?? section.viewer_premium,
        licensor: row.licensor ?? section.licensor,
        advertiser: row.advertiser ?? section.advertiser,
      };
    });
    const audience = audienceForUser(user);
    const visible = new Map(sections.map((s) => [s.key, isSectionVisible(s, audience)]));

    return {
      sections,
      audience,
      loading: records === null,
      isVisible: (key) => (visible.has(key) ? visible.get(key) : true),
    };
  }, [records, user]);

  return (
    <SectionVisibilityContext.Provider value={value}>{children}</SectionVisibilityContext.Provider>
  );
}

export function useSectionVisibility() {
  const context = useContext(SectionVisibilityContext);
  if (!context) throw new Error("useSectionVisibility must be used inside SectionVisibilityProvider");
  return context;
}
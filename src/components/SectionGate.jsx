import { useSectionVisibility } from "@/lib/SectionVisibilityContext";

// Renders its children only when the current audience is allowed to see that
// section (used for blocks inside a page, e.g. the YouTube feed on Home).
export default function SectionGate({ sectionKey, children }) {
  const { isVisible } = useSectionVisibility();
  if (!isVisible(sectionKey)) return null;
  return children;
}
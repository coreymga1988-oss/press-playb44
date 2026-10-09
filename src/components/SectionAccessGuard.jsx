import { Navigate, useLocation } from "react-router-dom";
import { EyeOff } from "lucide-react";
import { useSectionVisibility } from "@/lib/SectionVisibilityContext";
import { ROLE_HOME, sectionKeyForPath } from "@/lib/sectionCatalog";

// Keeps a hidden section reachable only by typing its URL: the visitor is sent
// back to a section their account type can actually open.
export default function SectionAccessGuard({ user, children }) {
  const location = useLocation();
  const { isVisible } = useSectionVisibility();
  const key = sectionKeyForPath(location.pathname);

  if (!key || isVisible(key)) return children;

  const home = ROLE_HOME[user?.role || "viewer"] || "/";
  if (home !== location.pathname && isVisible(sectionKeyForPath(home))) {
    return <Navigate to={home} replace />;
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center space-y-3">
      <EyeOff className="w-10 h-10 text-muted-foreground mx-auto" />
      <h1 className="text-2xl font-heading font-bold">Not available</h1>
      <p className="text-muted-foreground">This section isn't open to your account type right now.</p>
    </div>
  );
}
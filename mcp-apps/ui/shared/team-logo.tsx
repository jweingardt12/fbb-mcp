import { teamLogoFromAbbrev, teamLogoFromName, teamLogoUrl } from "./mlb-images";

interface TeamLogoProps {
  abbrev?: string;
  name?: string;
  teamId?: number;
  size?: number;
}

export function TeamLogo({ abbrev, name, teamId, size = 20 }: TeamLogoProps) {
  let url: string | null = null;
  if (teamId) {
    url = teamLogoUrl(teamId);
  } else if (abbrev) {
    url = teamLogoFromAbbrev(abbrev);
  } else if (name) {
    url = teamLogoFromName(name);
  }
  if (!url) return null;
  return (
    <img
      src={url}
      alt={abbrev || name || ""}
      width={size}
      height={size}
      style={{ display: "inline", flexShrink: 0 }}
    />
  );
}

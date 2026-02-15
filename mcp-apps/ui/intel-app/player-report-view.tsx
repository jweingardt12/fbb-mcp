import { useState } from "react";
import { IntelPanel } from "../shared/intel-panel";
import { IntelBadge, type PlayerIntel } from "../shared/intel-badge";
import { PlayerName } from "../shared/player-name";
import { Button } from "../components/ui/button";
import { Copy, Check } from "lucide-react";

// Data comes from /api/intel/player — it IS the PlayerIntel object with a name
interface PlayerReportData extends PlayerIntel {
  type: string;
  name: string;
}

export function PlayerReportView({ data, app, navigate }: { data: PlayerReportData; app: any; navigate: (data: any) => void }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    let text = "Player Report: " + data.name;
    if (data.statcast && data.statcast.quality_tier) { text += " - " + data.statcast.quality_tier; }
    if (data.trends && data.trends.hot_cold) { text += " - " + data.trends.hot_cold; }
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => { setCopied(false); }, 2000);
    });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold flex items-center gap-2">
        <PlayerName name={data.name} app={app} navigate={navigate} context="default" />
        <IntelBadge intel={data} size="md" />
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={handleCopy}>
          {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
        </Button>
      </h2>
      <IntelPanel intel={data} defaultExpanded />
    </div>
  );
}

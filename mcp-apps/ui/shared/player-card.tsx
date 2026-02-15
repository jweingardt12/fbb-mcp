import { Badge } from "../components/ui/badge";
import { mlbHeadshotUrl } from "./mlb-images";
import { ZScoreBadge } from "./z-score";

interface PlayerCardProps {
  name: string;
  position?: string;
  positions?: string[] | string;
  status?: string;
  team?: string;
  playerId?: string;
  mlbId?: number;
  percentOwned?: number;
  zScore?: number;
  compact?: boolean;
}

export function PlayerCard({ name, position, positions, status, team, mlbId, percentOwned, zScore, compact }: PlayerCardProps) {
  const posArray = Array.isArray(positions) ? positions : positions ? positions.split(",") : position ? [position] : [];

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {mlbId && <img src={mlbHeadshotUrl(mlbId)} alt="" className="w-8 h-8 rounded-full bg-muted object-cover" />}
        <span className="font-medium">{name}</span>
        {posArray.map((p) => <Badge key={p} variant="secondary" className="text-[10px]">{p}</Badge>)}
        {status && status !== "Healthy" && <Badge variant="destructive" className="text-[10px]">{status}</Badge>}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 py-1.5">
      {mlbId && <img src={mlbHeadshotUrl(mlbId)} alt="" className="w-10 h-10 rounded-full bg-muted object-cover ring-1 ring-border" />}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium truncate">{name}</span>
          {team && <span className="text-xs text-muted-foreground">{team}</span>}
        </div>
        <div className="flex items-center gap-1 mt-0.5">
          {posArray.map((p) => <Badge key={p} variant="outline" className="text-[10px]">{p}</Badge>)}
          {status && status !== "Healthy" && <Badge variant="destructive" className="text-[10px]">{status}</Badge>}
          {percentOwned !== undefined && <span className="text-xs text-muted-foreground ml-1">{percentOwned}% owned</span>}
          {zScore !== undefined && <ZScoreBadge z={zScore} size="sm" />}
        </div>
      </div>
    </div>
  );
}

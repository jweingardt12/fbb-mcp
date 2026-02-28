import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";

interface MlbStatsData {
  player_id: string;
  season: string;
  stats: Record<string, string | number>;
}

export function StatsView({ data }: { data: MlbStatsData }) {
  const entries = Object.entries(data.stats || {});

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-semibold">Player Stats</h2>
        <Badge variant="secondary">{data.season}</Badge>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {entries.map(([key, val]) => (
          <Card key={key}>
            <CardContent className="p-3 text-center">
              <p className="text-xl font-bold font-mono">{String(val)}</p>
              <p className="text-xs text-muted-foreground">{key}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">Player ID: {data.player_id}</p>
    </div>
  );
}

import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";

interface LeagueInfo {
  name: string;
  draft_status: string;
  season: string;
  start_date: string;
  end_date: string;
  current_week: number;
  num_teams: number;
  num_playoff_teams: number;
  max_weekly_adds: number;
  team_name: string;
  team_id: string;
}

export function InfoView({ data }: { data: LeagueInfo }) {
  const rows = [
    ["Season", data.season],
    ["Draft Status", data.draft_status],
    ["Current Week", String(data.current_week)],
    ["Start Date", data.start_date],
    ["End Date", data.end_date],
    ["Teams", String(data.num_teams)],
    ["Playoff Teams", String(data.num_playoff_teams)],
    ["Max Weekly Adds", String(data.max_weekly_adds)],
  ];

  return (
    <div className="space-y-2">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle>{data.name}</CardTitle>
            <Badge variant="secondary">{data.season}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {rows.map(([label, value]) => (
              <div key={label}>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-sm font-medium">{value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Your Team</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-medium">{data.team_name}</p>
          <p className="text-xs text-muted-foreground">{data.team_id}</p>
        </CardContent>
      </Card>
    </div>
  );
}

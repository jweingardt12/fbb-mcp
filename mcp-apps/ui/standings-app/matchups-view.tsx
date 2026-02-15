import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";

interface MatchupTeam {
  name: string;
  team_key?: string;
}

interface Matchup {
  team1: MatchupTeam | string;
  team2: MatchupTeam | string;
  status: string;
  week?: number;
  team1_logo?: string;
  team2_logo?: string;
}

interface MatchupsData {
  type: string;
  week: string;
  matchups: Matchup[];
}

const MY_TEAM = "You Can Clip These Wings";

function getTeamName(team: MatchupTeam | string): string {
  if (typeof team === "string") return team;
  return team.name || "?";
}

export function MatchupsView({ data }: { data: MatchupsData }) {
  const isScoreboard = data.type === "scoreboard";
  return (
    <div>
      <h2 className="text-lg font-semibold mb-3">
        {isScoreboard ? "Scoreboard" : "Matchups"} - Week {data.week}
      </h2>
      <div className="grid gap-3">
        {(data.matchups || []).map((m, i) => {
          const name1 = getTeamName(m.team1);
          const name2 = getTeamName(m.team2);
          const isMyMatchup = name1 === MY_TEAM || name2 === MY_TEAM;
          return (
            <Card key={i} className={isMyMatchup ? "border-primary border-2 bg-primary/5" : ""}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className={"font-medium flex items-center" + (name1 === MY_TEAM ? " text-primary" : "")} style={{ gap: "6px" }}>
                      {m.team1_logo && <img src={m.team1_logo} alt="" width={20} height={20} className="rounded-sm" style={{ flexShrink: 0 }} />}
                      {name1}
                    </p>
                  </div>
                  <div className="px-4">
                    <Badge variant="outline" className="text-xs">vs</Badge>
                  </div>
                  <div className="flex-1 text-right">
                    <p className={"font-medium flex items-center justify-end" + (name2 === MY_TEAM ? " text-primary" : "")} style={{ gap: "6px" }}>
                      {name2}
                      {m.team2_logo && <img src={m.team2_logo} alt="" width={20} height={20} className="rounded-sm" style={{ flexShrink: 0 }} />}
                    </p>
                  </div>
                </div>
                {m.status && (
                  <p className="text-xs text-muted-foreground text-center mt-2">{m.status}</p>
                )}
                {isMyMatchup && (
                  <p className="text-[10px] text-primary text-center mt-1 font-medium">Your Matchup</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

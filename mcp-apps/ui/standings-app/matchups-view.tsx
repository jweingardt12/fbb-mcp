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
      <h2 className="text-lg font-semibold mb-2">
        {isScoreboard ? "Scoreboard" : "Matchups"} - Week {data.week}
      </h2>
      <div className="grid gap-2">
        {(data.matchups || []).map((m, i) => {
          const name1 = getTeamName(m.team1);
          const name2 = getTeamName(m.team2);
          const isMyMatchup = name1 === MY_TEAM || name2 === MY_TEAM;
          return (
            <Card key={i} className={isMyMatchup ? "border-primary border-2 bg-primary/5" : ""}>
              <CardContent className="py-2 px-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className={"font-medium flex items-center" + (name1 === MY_TEAM ? " text-primary" : "")} style={{ gap: "6px" }}>
                      {m.team1_logo && <img src={m.team1_logo} alt="" width={28} height={28} className="rounded-sm" style={{ flexShrink: 0 }} />}
                      <span className="truncate">{name1}</span>
                    </p>
                  </div>
                  <div className="px-3 flex flex-col items-center flex-shrink-0">
                    <Badge variant="outline" className="text-xs">vs</Badge>
                    {m.status && <span className="text-xs text-muted-foreground mt-0.5">{m.status}</span>}
                  </div>
                  <div className="flex-1 min-w-0 text-right">
                    <p className={"font-medium flex items-center justify-end" + (name2 === MY_TEAM ? " text-primary" : "")} style={{ gap: "6px" }}>
                      <span className="truncate">{name2}</span>
                      {m.team2_logo && <img src={m.team2_logo} alt="" width={28} height={28} className="rounded-sm" style={{ flexShrink: 0 }} />}
                    </p>
                  </div>
                </div>
                {isMyMatchup && (
                  <p className="text-xs text-primary text-center mt-1 font-medium">Your Matchup</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

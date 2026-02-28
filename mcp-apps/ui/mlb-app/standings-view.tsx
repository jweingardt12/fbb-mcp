import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../components/ui/table";
import { TeamLogo } from "../shared/team-logo";

interface DivisionTeam {
  name: string;
  wins: number;
  losses: number;
  games_back: string;
  team_id?: number;
}

interface MlbDivision {
  division: string;
  teams: DivisionTeam[];
}

export function StandingsView({ data }: { data: { divisions: MlbDivision[] } }) {
  return (
    <div className="space-y-2">
      <h2 className="text-lg font-semibold">MLB Standings</h2>
      {(data.divisions || []).map((div) => (
        <Card key={div.division}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{div.division}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Team</TableHead>
                  <TableHead className="text-center w-12">W</TableHead>
                  <TableHead className="text-center w-12">L</TableHead>
                  <TableHead className="text-center w-14">GB</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(div.teams || []).map((t) => (
                  <TableRow key={t.name}>
                    <TableCell className="font-medium">
                      <span className="flex items-center" style={{ gap: "6px" }}>
                        <TeamLogo teamId={t.team_id} name={t.name} size={20} />
                        {t.name}
                      </span>
                    </TableCell>
                    <TableCell className="text-center font-mono">{t.wins}</TableCell>
                    <TableCell className="text-center font-mono">{t.losses}</TableCell>
                    <TableCell className="text-center font-mono text-muted-foreground">{t.games_back}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

import { Badge } from "../components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../components/ui/table";
import { TeamLogo } from "../shared/team-logo";

interface MlbGame {
  away: string;
  home: string;
  status: string;
  away_id?: number;
  home_id?: number;
}

interface MlbScheduleData {
  date: string;
  games: MlbGame[];
}

export function ScheduleView({ data }: { data: MlbScheduleData }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <h2 className="text-lg font-semibold">Schedule</h2>
        <Badge variant="secondary">{data.date}</Badge>
      </div>

      {(data.games || []).length === 0 ? (
        <p className="text-muted-foreground">No games scheduled for this date.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Away</TableHead>
              <TableHead className="text-center w-10">@</TableHead>
              <TableHead>Home</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(data.games || []).map((g, i) => (
              <TableRow key={i}>
                <TableCell className="font-medium">
                  <span className="flex items-center" style={{ gap: "5px" }}>
                    <TeamLogo teamId={g.away_id} abbrev={g.away} size={18} />
                    {g.away}
                  </span>
                </TableCell>
                <TableCell className="text-center text-muted-foreground">@</TableCell>
                <TableCell className="font-medium">
                  <span className="flex items-center" style={{ gap: "5px" }}>
                    <TeamLogo teamId={g.home_id} abbrev={g.home} size={18} />
                    {g.home}
                  </span>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{g.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <p className="text-xs text-muted-foreground mt-2">{(data.games || []).length} games</p>
    </div>
  );
}

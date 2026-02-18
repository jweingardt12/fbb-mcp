import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { TeamLogo } from "../shared/team-logo";

interface MlbInjury {
  player: string;
  team: string;
  description: string;
}

export function InjuriesView({ data }: { data: { injuries: MlbInjury[] } }) {
  if ((data.injuries || []).length === 0) {
    return (
      <div>
        <h2 className="text-lg font-semibold mb-3">MLB Injuries</h2>
        <p className="text-muted-foreground">No injuries reported (may be offseason).</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-lg font-semibold mb-3">MLB Injuries</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Player</TableHead>
            <TableHead>Team</TableHead>
            <TableHead>Description</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {(data.injuries || []).map((inj, i) => (
            <TableRow key={i}>
              <TableCell className="font-medium">{inj.player}</TableCell>
              <TableCell>
                <span className="flex items-center gap-1">
                  <TeamLogo name={inj.team} />
                  <Badge variant="secondary" className="text-xs">{inj.team}</Badge>
                </span>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">{inj.description}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <p className="text-xs text-muted-foreground mt-2">{data.injuries.length} injuries</p>
    </div>
  );
}

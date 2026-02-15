import { Badge } from "../components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../components/ui/table";
import { PlayerName } from "../shared/player-name";

interface MlbRosterPlayer {
  name: string;
  jersey_number: string;
  position: string;
}

interface MlbRosterData {
  team_name: string;
  players: MlbRosterPlayer[];
}

export function RosterView({ data, app, navigate }: { data: MlbRosterData; app?: any; navigate?: (data: any) => void }) {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-3">{data.team_name} Roster</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-14">#</TableHead>
            <TableHead>Player</TableHead>
            <TableHead>Position</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {(data.players || []).map((p) => (
            <TableRow key={p.name + p.jersey_number}>
              <TableCell className="font-mono">{p.jersey_number}</TableCell>
              <TableCell className="font-medium"><PlayerName name={p.name} app={app} navigate={navigate} context="default" /></TableCell>
              <TableCell>
                <Badge variant="outline" className="text-[10px]">{p.position}</Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <p className="text-xs text-muted-foreground mt-2">{(data.players || []).length} players</p>
    </div>
  );
}

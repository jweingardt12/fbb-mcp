import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { teamLogoUrl } from "../shared/mlb-images";

interface MlbTeam {
  id: number;
  name: string;
  abbreviation: string;
}

export function TeamsView({ data }: { data: { teams: MlbTeam[] } }) {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-2">MLB Teams</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {(data.teams || []).map((t) => (
          <Card key={t.id}>
            <CardContent className="p-3 flex items-center gap-3">
              <img src={teamLogoUrl(t.id)} alt={t.abbreviation} className="w-8 h-8" />
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{t.name}</p>
                <Badge variant="secondary" className="text-xs">{t.abbreviation}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

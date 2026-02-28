import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { mlbHeadshotUrl } from "../shared/mlb-images";
import { TeamLogo } from "../shared/team-logo";
import { IntelBadge } from "../shared/intel-badge";
import { IntelPanel } from "../shared/intel-panel";
import { PlayerName } from "../shared/player-name";

interface MlbPlayerData {
  name: string;
  position: string;
  team: string;
  bats: string;
  throws: string;
  age: number;
  mlb_id: number;
  intel?: any;
}

export function PlayerView({ data, app, navigate }: { data: MlbPlayerData; app?: any; navigate?: (data: any) => void }) {
  return (
    <Card className="w-full animate-slide-up">
      <CardHeader>
        <div className="flex items-center gap-3 sm:gap-3">
          <img src={mlbHeadshotUrl(data.mlb_id)} alt={data.name} className="w-16 h-16 rounded-full bg-muted object-cover" />
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <CardTitle><PlayerName name={data.name} mlbId={data.mlb_id} app={app} navigate={navigate} context="default" showHeadshot={false} /></CardTitle>
              {data.intel && <IntelBadge intel={data.intel} size="sm" />}
            </div>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <Badge variant="default">{data.position}</Badge>
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <TeamLogo abbrev={data.team} />
                {data.team}
              </span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="animate-stagger grid grid-cols-1 min-[380px]:grid-cols-3 gap-2 sm:gap-3 text-center">
          <div>
            <p className="text-xl sm:text-2xl font-bold">{data.age}</p>
            <p className="text-xs text-muted-foreground">Age</p>
          </div>
          <div>
            <p className="text-xl sm:text-2xl font-bold">{data.bats}</p>
            <p className="text-xs text-muted-foreground">Bats</p>
          </div>
          <div>
            <p className="text-xl sm:text-2xl font-bold">{data.throws}</p>
            <p className="text-xs text-muted-foreground">Throws</p>
          </div>
        </div>
        {data.intel && <IntelPanel intel={data.intel} />}
      </CardContent>
    </Card>
  );
}

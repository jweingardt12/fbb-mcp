import { mountApp } from "../shared/boot";
import { AppShell } from "../shared/app-shell";
import { TeamsView } from "./teams-view";
import { RosterView } from "./roster-view";
import { PlayerView } from "./player-view";
import { StatsView } from "./stats-view";
import { InjuriesView } from "./injuries-view";
import { StandingsView } from "./standings-view";
import { ScheduleView } from "./schedule-view";
import "../globals.css";

function MlbApp() {
  return (
    <AppShell name="MLB Data">
      {({ data, toolName, app, navigate }) => {
        switch (toolName) {
          case "mlb-teams": return <TeamsView data={data} />;
          case "mlb-roster": return <RosterView data={data} app={app} navigate={navigate} />;
          case "mlb-player": return <PlayerView data={data} app={app} navigate={navigate} />;
          case "mlb-stats": return <StatsView data={data} />;
          case "mlb-injuries": return <InjuriesView data={data} />;
          case "mlb-standings": return <StandingsView data={data} />;
          case "mlb-schedule": return <ScheduleView data={data} />;
          default: return <div className="p-4 text-muted-foreground">Unknown view: {toolName}</div>;
        }
      }}
    </AppShell>
  );
}

mountApp(MlbApp);

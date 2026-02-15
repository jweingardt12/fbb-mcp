import { mountApp } from "../shared/boot";
import { AppShell } from "../shared/app-shell";
import { LeagueHistoryView } from "./league-history-view";
import { RecordBookView } from "./record-book-view";
import { PastStandingsView } from "./past-standings-view";
import { PastDraftView } from "./past-draft-view";
import { PastTeamsView } from "./past-teams-view";
import { PastTradesView } from "./past-trades-view";
import { PastMatchupView } from "./past-matchup-view";
import "../globals.css";

function HistoryApp() {
  return (
    <AppShell name="Yahoo Fantasy History">
      {({ data, toolName, app, navigate }) => {
        switch (toolName) {
          case "league-history": return <LeagueHistoryView data={data} />;
          case "record-book": return <RecordBookView data={data} />;
          case "past-standings": return <PastStandingsView data={data} app={app} navigate={navigate} />;
          case "past-draft": return <PastDraftView data={data} app={app} navigate={navigate} />;
          case "past-teams": return <PastTeamsView data={data} app={app} navigate={navigate} />;
          case "past-trades": return <PastTradesView data={data} app={app} navigate={navigate} />;
          case "past-matchup": return <PastMatchupView data={data} app={app} navigate={navigate} />;
          default: return <div className="p-4 text-muted-foreground">Unknown view: {toolName}</div>;
        }
      }}
    </AppShell>
  );
}

mountApp(HistoryApp);

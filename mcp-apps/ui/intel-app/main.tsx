import { mountApp } from "../shared/boot";
import { AppShell } from "../shared/app-shell";
import { PlayerReportView } from "./player-report-view";
import { BreakoutsView } from "./breakouts-view";
import { RedditView } from "./reddit-view";
import { ProspectsView } from "./prospects-view";
import { TransactionsView } from "./transactions-view";
import "../globals.css";

function IntelApp() {
  return (
    <AppShell name="Fantasy Intelligence">
      {({ data, toolName, app, navigate }) => {
        switch (toolName) {
          case "intel-player": return <PlayerReportView data={data} app={app} navigate={navigate} />;
          case "intel-breakouts":
          case "intel-busts": return <BreakoutsView data={data} app={app} navigate={navigate} />;
          case "intel-reddit":
          case "intel-trending": return <RedditView data={data} app={app} navigate={navigate} />;
          case "intel-prospects": return <ProspectsView data={data} app={app} navigate={navigate} />;
          case "intel-transactions": return <TransactionsView data={data} app={app} navigate={navigate} />;
          default: return <div className="p-4 text-muted-foreground">Unknown view: {toolName}</div>;
        }
      }}
    </AppShell>
  );
}

mountApp(IntelApp);

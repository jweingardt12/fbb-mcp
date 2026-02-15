import { mountApp } from "../shared/boot";
import { AppShell } from "../shared/app-shell";
import { RankingsView } from "./rankings-view";
import { CompareView } from "./compare-view";
import { ValueView } from "./value-view";
import "../globals.css";

function ValuationsApp() {
  return (
    <AppShell name="Yahoo Fantasy Valuations">
      {({ data, toolName, app, navigate }) => {
        switch (toolName) {
          case "rankings": return <RankingsView data={data} app={app} navigate={navigate} />;
          case "compare": return <CompareView data={data} app={app} navigate={navigate} />;
          case "value": return <ValueView data={data} app={app} navigate={navigate} />;
          default: return <div className="p-4 text-muted-foreground">Unknown view: {toolName}</div>;
        }
      }}
    </AppShell>
  );
}

mountApp(ValuationsApp);

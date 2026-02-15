import { LineupOptimizeView } from "./lineup-optimize-view";
import { InjuryReportView } from "./injury-report-view";

interface DailyUpdateData {
  lineup: any;
  injuries: any;
  message: string;
}

function noop() {}

export function DailyUpdateView({ data, app, navigate }: { data: DailyUpdateData; app?: any; navigate?: (data: any) => void }) {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Daily Update</h2>
      {data.lineup && <LineupOptimizeView data={data.lineup} app={app || null} navigate={navigate || noop} />}
      {data.injuries && <InjuryReportView data={data.injuries} />}
      <p className="text-xs text-muted-foreground">{data.message}</p>
    </div>
  );
}

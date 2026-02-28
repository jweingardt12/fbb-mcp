import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { PlayerName } from "../shared/player-name";
import { AlertTriangle } from "@/shared/icons";
import { parseRoundKey, sortRoundEntries } from "./round-key";

interface CheatsheetData {
  strategy?: Record<string, string>;
  rounds?: Record<string, string>;
  targets?: Record<string, string[]> | string[];
  avoid?: string[];
  opponents?: Array<{ name: string; tendency: string }>;
}

export function CheatsheetView({ data, app, navigate }: { data: CheatsheetData; app?: any; navigate?: (data: any) => void }) {
  const strategyMap = data.strategy || data.rounds || {};
  const roundEntries = sortRoundEntries(Object.entries(strategyMap));

  // Targets can be either Record<string, string[]> or string[]
  const targetMap = data.targets || {};
  const isTargetArray = Array.isArray(targetMap);

  return (
    <div className="space-y-2">
      <h2 className="text-lg font-semibold">Draft Cheat Sheet</h2>

      {/* Round-by-round strategy */}
      {roundEntries.length > 0 && (
        <div className="space-y-2">
          {roundEntries.map(function (entry) {
            const roundInfo = entry[0];
            const strategy = entry[1];
            return (
              <Card key={roundInfo.rawKey}>
                <CardContent className="p-3 sm:p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-3">
                    <span className="app-chip w-fit">{roundInfo.shortLabel}</span>
                    <p className="text-sm font-medium text-muted-foreground">{roundInfo.label}</p>
                  </div>
                  <p className="text-sm leading-6 mt-2 break-words">{strategy}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Targets - array format */}
      {isTargetArray && (targetMap as string[]).length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Key Targets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {(targetMap as string[]).map(function (t) {
                return <Badge key={t} variant="secondary" className="text-sm py-1 px-3"><PlayerName name={t} app={app} navigate={navigate} context="draft" /></Badge>;
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Targets - record format */}
      {!isTargetArray && Object.keys(targetMap).length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Key Targets</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(targetMap as Record<string, string[]>).map(function (entry) {
              const rawCategory = entry[0];
              const category = parseRoundKey(rawCategory).label;
              const players = entry[1];
              return (
                <div key={rawCategory}>
                  <p className="text-xs text-muted-foreground mb-1">{category}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {players.map(function (t) {
                      return <Badge key={t} variant="secondary" className="text-xs py-0.5 px-2"><PlayerName name={t} app={app} navigate={navigate} context="draft" /></Badge>;
                    })}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Avoid List */}
      {(data.avoid || []).length > 0 && (
        <Card className="border-yellow-500/50">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <CardTitle className="text-base text-yellow-600 dark:text-yellow-400">Avoid</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {(data.avoid || []).map(function (name) {
                return <Badge key={name} variant="outline" className="text-xs border-yellow-500 text-yellow-600 dark:text-yellow-400">{name}</Badge>;
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Opponents */}
      {(data.opponents || []).length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Opponents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1.5">
              {(data.opponents || []).map(function (opp) {
                return (
                  <div key={opp.name} className="flex items-center justify-between text-sm">
                    <span className="font-medium">{opp.name}</span>
                    <span className="text-xs text-muted-foreground">{opp.tendency}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

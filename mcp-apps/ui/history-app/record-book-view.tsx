import { useState } from "react";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";
import { Trophy, TrendingUp, Target, Award } from "@/shared/icons";
import { formatFixed } from "../shared/number-format";

interface CareerEntry {
  manager: string;
  seasons: number;
  wins: number;
  losses: number;
  ties: number;
  win_pct: number;
  playoffs: number;
  best_finish: number;
  best_year: number;
}

interface ChampionEntry {
  year: number;
  team_name: string;
  manager: string;
  record: string;
  win_pct: number;
}

interface RecordBookData {
  careers: CareerEntry[];
  champions: ChampionEntry[];
  first_picks: Array<{ year: number; player: string }>;
  playoff_appearances: Array<{ manager: string; appearances: number }>;
}

export function RecordBookView({ data }: { data: RecordBookData }) {
  const [tab, setTab] = useState("champions");

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Record Book</h2>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList behavior="wrap">
          <TabsTrigger value="champions">
            <span className="flex items-center gap-1"><Trophy className="h-3.5 w-3.5" />Champions</span>
          </TabsTrigger>
          <TabsTrigger value="careers">
            <span className="flex items-center gap-1"><TrendingUp className="h-3.5 w-3.5" />Career Leaders</span>
          </TabsTrigger>
          <TabsTrigger value="first_picks">
            <span className="flex items-center gap-1"><Target className="h-3.5 w-3.5" />First Picks</span>
          </TabsTrigger>
          <TabsTrigger value="playoffs">
            <span className="flex items-center gap-1"><Award className="h-3.5 w-3.5" />Playoffs</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="champions">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Year</TableHead>
                <TableHead>Team</TableHead>
                <TableHead className="hidden sm:table-cell">Manager</TableHead>
                <TableHead>Record</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(data.champions || []).map((c) => (
                <TableRow key={c.year}>
                  <TableCell className="font-mono font-medium">{c.year}</TableCell>
                  <TableCell className="font-medium">{c.team_name}</TableCell>
                  <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">{c.manager}</TableCell>
                  <TableCell className="font-mono text-sm">{c.record}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value="careers">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Manager</TableHead>
                <TableHead className="text-center">Seasons</TableHead>
                <TableHead className="text-center">W</TableHead>
                <TableHead className="text-center">L</TableHead>
                <TableHead className="hidden sm:table-cell text-center">T</TableHead>
                <TableHead className="text-right">Win%</TableHead>
                <TableHead className="hidden sm:table-cell text-center">Playoffs</TableHead>
                <TableHead className="hidden sm:table-cell text-center">Best</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(data.careers || []).map((c) => (
                <TableRow key={c.manager}>
                  <TableCell className="font-medium">{c.manager}</TableCell>
                  <TableCell className="text-center font-mono">{c.seasons}</TableCell>
                  <TableCell className="text-center font-mono">{c.wins}</TableCell>
                  <TableCell className="text-center font-mono">{c.losses}</TableCell>
                  <TableCell className="hidden sm:table-cell text-center font-mono">{c.ties}</TableCell>
                  <TableCell className="text-right font-mono">{formatFixed(c.win_pct, 1, "0.0")}%</TableCell>
                  <TableCell className="hidden sm:table-cell text-center font-mono">{c.playoffs}</TableCell>
                  <TableCell className="hidden sm:table-cell text-center">
                    <Badge variant="secondary" className="text-xs">#{c.best_finish} ({c.best_year})</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value="first_picks">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(data.first_picks || []).map((fp) => (
              <Card key={fp.year}>
                <CardContent className="p-3">
                  <p className="text-xs text-muted-foreground">{fp.year}</p>
                  <p className="font-medium">{fp.player}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="playoffs">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Manager</TableHead>
                <TableHead className="text-right">Appearances</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(data.playoff_appearances || []).map((pa) => (
                <TableRow key={pa.manager}>
                  <TableCell className="font-medium">{pa.manager}</TableCell>
                  <TableCell className="text-right font-mono">{pa.appearances}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>
    </div>
  );
}

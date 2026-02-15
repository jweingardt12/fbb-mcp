import { Badge } from "../components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";

interface StatCategory {
  display_name: string;
  name?: string;
  position_type?: string;
}

export function StatCategoriesView({ data }: { data: { categories: StatCategory[] } }) {
  const batting = (data.categories || []).filter((c) => c.position_type === "B");
  const pitching = (data.categories || []).filter((c) => c.position_type === "P");
  const other = (data.categories || []).filter((c) => !c.position_type);

  const renderGroup = (title: string, cats: StatCategory[]) => {
    if (cats.length === 0) return null;
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {cats.map((c) => (
              <Badge key={c.display_name} variant="outline" className="text-sm py-1 px-3">
                {c.display_name}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Stat Categories</h2>
      {renderGroup("Batting", batting)}
      {renderGroup("Pitching", pitching)}
      {renderGroup("Other", other)}
    </div>
  );
}

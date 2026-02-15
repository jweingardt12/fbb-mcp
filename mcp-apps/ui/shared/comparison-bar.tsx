interface ComparisonBarProps {
  label: string;
  leftValue: string;
  rightValue: string;
  result: "win" | "loss" | "tie";
  leftLabel?: string;
  rightLabel?: string;
}

const RESULT_STYLES = {
  win: { leftBg: "bg-green-500", leftText: "text-green-600 dark:text-green-400", rightText: "text-red-500" },
  loss: { leftBg: "bg-red-500/60", leftText: "text-red-500", rightText: "text-green-600 dark:text-green-400" },
  tie: { leftBg: "bg-yellow-500/60", leftText: "text-yellow-600 dark:text-yellow-400", rightText: "text-yellow-600 dark:text-yellow-400" },
};

export function ComparisonBar({ label, leftValue, rightValue, result, leftLabel, rightLabel }: ComparisonBarProps) {
  const leftNum = parseFloat(leftValue) || 0;
  const rightNum = parseFloat(rightValue) || 0;
  const total = leftNum + rightNum;
  const leftPct = total > 0 ? Math.max(15, (leftNum / total) * 100) : 50;
  const colors = RESULT_STYLES[result];

  return (
    <div className="space-y-0.5">
      <div className="flex items-center justify-between text-xs">
        <span className={"font-medium " + colors.leftText}>
          {leftLabel ? leftLabel + " " : ""}{leftValue}
        </span>
        <span className="text-muted-foreground font-medium">{label}</span>
        <span className={"font-medium " + colors.rightText}>
          {rightValue}{rightLabel ? " " + rightLabel : ""}
        </span>
      </div>
      <div className="h-2 rounded-full overflow-hidden bg-muted">
        <div className={"h-full rounded-full transition-all " + colors.leftBg} style={{ width: leftPct + "%" }} />
      </div>
    </div>
  );
}

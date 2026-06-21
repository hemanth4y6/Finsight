import { cn } from "@/lib/utils";

interface RiskIndicatorProps {
  label: string;
  value: string | number;
  level: "low" | "medium" | "high" | "critical";
  subtitle?: string;
}

const RiskIndicator = ({ label, value, level, subtitle }: RiskIndicatorProps) => {
  const levelStyles = {
    low: "bg-risk-low/10 text-risk-low border-risk-low/30",
    medium: "bg-risk-medium/10 text-risk-medium border-risk-medium/30",
    high: "bg-risk-high/10 text-risk-high border-risk-high/30",
    critical: "bg-risk-critical/10 text-risk-critical border-risk-critical/30",
  };

  const dotStyles = {
    low: "bg-risk-low",
    medium: "bg-risk-medium",
    high: "bg-risk-high",
    critical: "bg-risk-critical",
  };

  return (
    <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 border border-border/50">
      <div className="flex items-center gap-3">
        <div className={cn("w-2.5 h-2.5 rounded-full animate-pulse", dotStyles[level])} />
        <div>
          <div className="text-sm text-muted-foreground">{label}</div>
          {subtitle && <div className="text-xs text-muted-foreground/70 mt-0.5">{subtitle}</div>}
        </div>
      </div>
      <div className={cn(
        "px-3 py-1.5 rounded-full text-sm font-semibold border",
        levelStyles[level]
      )}>
        {value}
      </div>
    </div>
  );
};

export default RiskIndicator;

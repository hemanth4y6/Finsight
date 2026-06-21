import { Brain, TrendingUp, TrendingDown, Minus, AlertCircle, CheckCircle, Info } from "lucide-react";

interface RiskDriver {
  factor: string;
  impact: "positive" | "negative" | "neutral";
  weight: number;
  description: string;
}

interface AIExplainabilityProps {
  drivers: RiskDriver[];
  summary: string;
}

const AIExplainability = ({ drivers, summary }: AIExplainabilityProps) => {
  const getImpactIcon = (impact: RiskDriver["impact"]) => {
    switch (impact) {
      case "positive":
        return <TrendingDown className="w-4 h-4 text-risk-low" />;
      case "negative":
        return <TrendingUp className="w-4 h-4 text-risk-critical" />;
      case "neutral":
        return <Minus className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getImpactColor = (impact: RiskDriver["impact"]) => {
    switch (impact) {
      case "positive":
        return "bg-risk-low/10 border-risk-low/20";
      case "negative":
        return "bg-risk-critical/10 border-risk-critical/20";
      case "neutral":
        return "bg-muted border-border";
    }
  };

  const sortedDrivers = [...drivers].sort((a, b) => b.weight - a.weight);

  return (
    <div className="space-y-5">
      {/* Summary */}
      <div className="flex gap-3 p-4 rounded-lg bg-primary/5 border border-primary/20">
        <Brain className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
        <p className="text-sm text-foreground leading-relaxed">{summary}</p>
      </div>

      {/* Risk Drivers */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <Info className="w-4 h-4" />
          Key Risk Drivers
        </h4>
        
        <div className="space-y-2">
          {sortedDrivers.map((driver, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg border ${getImpactColor(driver.impact)} transition-all hover:scale-[1.01]`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">{getImpactIcon(driver.impact)}</div>
                  <div>
                    <div className="font-medium text-foreground">{driver.factor}</div>
                    <div className="text-sm text-muted-foreground mt-0.5">{driver.description}</div>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <div className={`
                    px-2 py-1 rounded text-xs font-mono font-medium
                    ${driver.impact === "positive" ? "bg-risk-low/20 text-risk-low" : ""}
                    ${driver.impact === "negative" ? "bg-risk-critical/20 text-risk-critical" : ""}
                    ${driver.impact === "neutral" ? "bg-muted text-muted-foreground" : ""}
                  `}>
                    {driver.weight > 0 ? "+" : ""}{driver.weight}%
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 pt-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <CheckCircle className="w-3.5 h-3.5 text-risk-low" />
          <span>Reduces Risk</span>
        </div>
        <div className="flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 text-risk-critical" />
          <span>Increases Risk</span>
        </div>
      </div>
    </div>
  );
};

export default AIExplainability;

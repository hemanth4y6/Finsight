import { Clock, AlertTriangle, TrendingDown } from "lucide-react";

interface TimeToStressProps {
  days: number;
  trend: "stable" | "declining" | "critical";
}

const TimeToStress = ({ days, trend }: TimeToStressProps) => {
  const getTrendInfo = () => {
    switch (trend) {
      case "stable":
        return { 
          icon: Clock, 
          label: "Stable trajectory", 
          color: "text-risk-low",
          bgColor: "bg-risk-low/10",
        };
      case "declining":
        return { 
          icon: TrendingDown, 
          label: "Declining trend", 
          color: "text-risk-medium",
          bgColor: "bg-risk-medium/10",
        };
      case "critical":
        return { 
          icon: AlertTriangle, 
          label: "Critical path", 
          color: "text-risk-critical",
          bgColor: "bg-risk-critical/10",
        };
    }
  };

  const trendInfo = getTrendInfo();
  const TrendIcon = trendInfo.icon;

  const formatDays = (d: number) => {
    if (d >= 365) {
      const years = Math.floor(d / 365);
      return `${years}+ year${years > 1 ? 's' : ''}`;
    }
    if (d >= 30) {
      const months = Math.floor(d / 30);
      return `~${months} month${months > 1 ? 's' : ''}`;
    }
    return `${d} days`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-baseline gap-2">
        <span className={`text-4xl font-bold font-mono ${trendInfo.color}`}>
          {formatDays(days)}
        </span>
      </div>
      
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${trendInfo.bgColor}`}>
        <TrendIcon className={`w-4 h-4 ${trendInfo.color}`} />
        <span className={`text-sm font-medium ${trendInfo.color}`}>
          {trendInfo.label}
        </span>
      </div>
      
      <p className="text-sm text-muted-foreground leading-relaxed">
        Based on current spending patterns and income stability, this is the estimated 
        time until financial reserves may become insufficient.
      </p>
    </div>
  );
};

export default TimeToStress;

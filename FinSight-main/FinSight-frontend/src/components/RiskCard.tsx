import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface RiskCardProps {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  glowColor?: "low" | "medium" | "high" | "critical" | "primary";
}

const RiskCard = ({ title, icon, children, className, glowColor }: RiskCardProps) => {
  const glowClasses = {
    low: "risk-glow-low",
    medium: "risk-glow-medium",
    high: "risk-glow-high",
    critical: "risk-glow-critical",
    primary: "shadow-[0_0_60px_-10px_hsl(var(--primary)/0.3)]",
  };

  return (
    <div className={cn(
      "glass-card p-6",
      glowColor && glowClasses[glowColor],
      className
    )}>
      <div className="flex items-center gap-3 mb-4">
        {icon && (
          <div className="p-2 rounded-lg bg-secondary">
            {icon}
          </div>
        )}
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      </div>
      {children}
    </div>
  );
};

export default RiskCard;

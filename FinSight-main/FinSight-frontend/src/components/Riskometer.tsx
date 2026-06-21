import { useEffect, useState } from "react";

interface RiskometerProps {
  score: number;
  size?: number;
}

const Riskometer = ({ score, size = 280 }: RiskometerProps) => {
  const [animatedScore, setAnimatedScore] = useState(0);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedScore(score);
    }, 100);
    return () => clearTimeout(timer);
  }, [score]);

  const getRiskLevel = (value: number) => {
    if (value <= 25) return { label: "Low Risk", color: "var(--risk-low)" };
    if (value <= 50) return { label: "Medium Risk", color: "var(--risk-medium)" };
    if (value <= 75) return { label: "High Risk", color: "var(--risk-high)" };
    return { label: "Critical Risk", color: "var(--risk-critical)" };
  };

  const riskInfo = getRiskLevel(score);
  const rotation = (animatedScore / 100) * 180 - 90;
  
  const strokeWidth = 20;
  const radius = (size - strokeWidth) / 2;
  const circumference = Math.PI * radius;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative" style={{ width: size, height: size / 2 + 40 }}>
        <svg
          width={size}
          height={size / 2 + 20}
          viewBox={`0 0 ${size} ${size / 2 + 20}`}
          className="overflow-visible"
        >
          {/* Background arc */}
          <path
            d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          
          {/* Gradient definition */}
          <defs>
            <linearGradient id="riskGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(var(--risk-low))" />
              <stop offset="33%" stopColor="hsl(var(--risk-medium))" />
              <stop offset="66%" stopColor="hsl(var(--risk-high))" />
              <stop offset="100%" stopColor="hsl(var(--risk-critical))" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          {/* Colored arc based on score */}
          <path
            d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
            fill="none"
            stroke="url(#riskGradient)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - animatedScore / 100)}
            style={{ transition: "stroke-dashoffset 1s ease-out" }}
            filter="url(#glow)"
          />
          
          {/* Tick marks */}
          {[0, 25, 50, 75, 100].map((tick) => {
            const angle = (tick / 100) * 180 - 180;
            const rad = (angle * Math.PI) / 180;
            const x1 = size / 2 + (radius - strokeWidth / 2 - 5) * Math.cos(rad);
            const y1 = size / 2 + (radius - strokeWidth / 2 - 5) * Math.sin(rad);
            const x2 = size / 2 + (radius - strokeWidth / 2 - 15) * Math.cos(rad);
            const y2 = size / 2 + (radius - strokeWidth / 2 - 15) * Math.sin(rad);
            return (
              <line
                key={tick}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="hsl(var(--muted-foreground))"
                strokeWidth={2}
                opacity={0.5}
              />
            );
          })}
        </svg>
        
        {/* Needle */}
        <div
          className="absolute left-1/2 bottom-[40px] origin-bottom"
          style={{
            width: 4,
            height: radius - 30,
            marginLeft: -2,
            transform: `rotate(${rotation}deg)`,
            transition: "transform 1s ease-out",
          }}
        >
          <div 
            className="w-full h-full rounded-full"
            style={{ 
              background: `linear-gradient(to top, hsl(${riskInfo.color}), hsl(${riskInfo.color}) 70%, transparent)`,
              boxShadow: `0 0 20px hsl(${riskInfo.color} / 0.6)`,
            }}
          />
        </div>
        
        {/* Center circle */}
        <div 
          className="absolute left-1/2 bottom-[32px] w-5 h-5 rounded-full -translate-x-1/2"
          style={{ 
            background: `hsl(${riskInfo.color})`,
            boxShadow: `0 0 20px hsl(${riskInfo.color} / 0.6)`,
          }}
        />
        
        {/* Score labels */}
        <div className="absolute bottom-0 left-0 text-xs font-mono text-muted-foreground">0</div>
        <div className="absolute bottom-0 right-0 text-xs font-mono text-muted-foreground">100</div>
      </div>
      
      {/* Score display */}
      <div className="text-center -mt-2">
        <div 
          className="text-5xl font-bold font-mono tabular-nums"
          style={{ color: `hsl(${riskInfo.color})` }}
        >
          {Math.round(animatedScore)}
        </div>
        <div 
          className="text-lg font-semibold mt-1 uppercase tracking-wider"
          style={{ color: `hsl(${riskInfo.color})` }}
        >
          {riskInfo.label}
        </div>
      </div>
    </div>
  );
};

export default Riskometer;

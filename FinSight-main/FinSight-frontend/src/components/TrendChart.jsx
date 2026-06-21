import {
  ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine,
} from "recharts";

const COLORS = {
  income:   "#3b82f6",
  expenses: "#f97316",
  balance:  "#10b981",
  forecast: "rgba(139,92,246,0.3)",
};

function fmt(val) {
  if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
  if (val >= 1000)   return `₹${(val / 1000).toFixed(0)}K`;
  return `₹${val}`;
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const isForecast = payload[0]?.payload?.forecast;

  return (
    <div style={{
      background: "#0f172a",
      border: "1px solid rgba(255,255,255,0.12)",
      borderRadius: "12px",
      padding: "12px 16px",
      minWidth: "180px",
    }}>
      <p style={{ color: "#64748b", fontSize: "12px", marginBottom: "8px", fontWeight: 600 }}>
        {label} {isForecast ? "(Forecast)" : ""}
      </p>
      {payload.map((p) => (
        <div key={p.dataKey} style={{
          display: "flex", justifyContent: "space-between",
          gap: "16px", marginBottom: "4px",
        }}>
          <span style={{ color: p.color, fontSize: "13px", textTransform: "capitalize" }}>
            {p.dataKey}
          </span>
          <span style={{ color: "#f1f5f9", fontSize: "13px", fontWeight: 600 }}>
            {fmt(p.value)}
          </span>
        </div>
      ))}
    </div>
  );
};

export default function TrendChart({ data = [] }) {
  if (!data.length) return null;

  const firstForecastIdx = data.findIndex((d) => d.forecast);
  const splitMonth = firstForecastIdx > 0 ? data[firstForecastIdx - 1].month : null;

  return (
    <div style={{ width: "100%", height: 320 }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor={COLORS.income}   stopOpacity={0.25} />
              <stop offset="95%" stopColor={COLORS.income}   stopOpacity={0} />
            </linearGradient>
            <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor={COLORS.expenses} stopOpacity={0.2} />
              <stop offset="95%" stopColor={COLORS.expenses} stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />

          <XAxis
            dataKey="month"
            tick={{ fill: "#64748b", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={fmt}
            tick={{ fill: "#64748b", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={60}
          />

          <Tooltip content={<CustomTooltip />} />

          <Legend
            wrapperStyle={{ fontSize: "13px", paddingTop: "16px" }}
            formatter={(val) => (
              <span style={{ color: "#cbd5e1", textTransform: "capitalize" }}>{val}</span>
            )}
          />

          {/* Forecast divider */}
          {splitMonth && (
            <ReferenceLine
              x={splitMonth}
              stroke="rgba(139,92,246,0.5)"
              strokeDasharray="6 3"
              label={{ value: "Forecast →", fill: "#8b5cf6", fontSize: 11, position: "insideTopRight" }}
            />
          )}

          <Area
            type="monotone" dataKey="income"
            stroke={COLORS.income} strokeWidth={2}
            fill="url(#incomeGrad)"
            dot={false} activeDot={{ r: 5, fill: COLORS.income }}
          />
          <Area
            type="monotone" dataKey="expenses"
            stroke={COLORS.expenses} strokeWidth={2}
            fill="url(#expenseGrad)"
            dot={false} activeDot={{ r: 5, fill: COLORS.expenses }}
          />
          <Line
            type="monotone" dataKey="balance"
            stroke={COLORS.balance} strokeWidth={2.5}
            strokeDasharray={(d) => d?.forecast ? "6 3" : "0"}
            dot={false} activeDot={{ r: 5, fill: COLORS.balance }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

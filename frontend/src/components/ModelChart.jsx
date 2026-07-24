import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid,
} from "recharts";

export default function ModelChart({ perModel }) {
  const data = Object.entries(perModel).map(([name, m]) => ({
    name: name.replace(/_/g, " "),
    confidence: m.confidence,
    prediction: m.prediction,
  }));

  return (
    <div style={{ width: "100%", height: 190 }}>
      <ResponsiveContainer>
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 24, left: 4, bottom: 4 }}>
          <CartesianGrid strokeDasharray="2 4" stroke="rgba(16,24,38,0.08)" horizontal={false} />
          <XAxis
            type="number"
            domain={[0, 100]}
            tick={{ fill: "#8b97ac", fontSize: 10.5, fontFamily: "JetBrains Mono" }}
            axisLine={{ stroke: "rgba(16,24,38,0.12)" }}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={92}
            tick={{ fill: "#8b97ac", fontSize: 10.5, fontFamily: "JetBrains Mono" }}
            axisLine={{ stroke: "rgba(16,24,38,0.12)" }}
            tickLine={false}
          />
          <Tooltip
            cursor={{ fill: "rgba(62,111,242,0.06)" }}
            contentStyle={{
              background: "rgba(255,255,255,0.92)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(16,24,38,0.08)",
              borderRadius: 10,
              fontFamily: "JetBrains Mono",
              fontSize: 12,
              boxShadow: "0 12px 32px -12px rgba(62,111,242,0.25)",
            }}
            labelStyle={{ color: "#101826" }}
            formatter={(val, _key, entry) => [`${val.toFixed(1)}% → ${entry.payload.prediction}`, "confidence"]}
          />
          <Bar dataKey="confidence" radius={[0, 6, 6, 0]} isAnimationActive animationDuration={700}>
            {data.map((d, i) => (
              <Cell key={i} fill={d.confidence > 60 ? "#8b5cf6" : "#14b8a6"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

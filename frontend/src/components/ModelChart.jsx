import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid,
} from "recharts";

export default function ModelChart({ perModel }) {
  const data = Object.entries(perModel).map(([name, m]) => ({
    name: name.replace("_", " "),
    confidence: m.confidence,
    prediction: m.prediction,
  }));

  return (
    <div style={{ width: "100%", height: 190 }}>
      <ResponsiveContainer>
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 24, left: 4, bottom: 4 }}>
          <CartesianGrid strokeDasharray="2 4" stroke="#dde1e6" horizontal={false} />
          <XAxis
            type="number"
            domain={[0, 100]}
            tick={{ fill: "#6b7684", fontSize: 10.5, fontFamily: "IBM Plex Mono" }}
            axisLine={{ stroke: "#b9c0c9" }}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={92}
            tick={{ fill: "#6b7684", fontSize: 10.5, fontFamily: "IBM Plex Mono" }}
            axisLine={{ stroke: "#b9c0c9" }}
            tickLine={false}
          />
          <Tooltip
            cursor={{ fill: "#f4f5f7" }}
            contentStyle={{
              background: "#ffffff",
              border: "1px solid #b9c0c9",
              borderRadius: 2,
              fontFamily: "IBM Plex Mono",
              fontSize: 12,
            }}
            labelStyle={{ color: "#14181d" }}
            formatter={(val, _key, entry) => [`${val.toFixed(1)}% → ${entry.payload.prediction}`, "confidence"]}
          />
          <Bar dataKey="confidence" radius={[0, 2, 2, 0]} isAnimationActive animationDuration={700}>
            {data.map((d, i) => (
              <Cell key={i} fill={d.confidence > 60 ? "#c81e3a" : "#0e7c86"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useRequireSession } from "../../lib/useSession";
import { supabase } from "../../lib/supabaseClient";
import { dateStr } from "../../lib/date";

const RANGES = [
  { label: "최근 7일", days: 7 },
  { label: "최근 30일", days: 30 },
  { label: "전체", days: null },
];

const tooltipStyle = {
  background: "#2f2b28",
  border: "1px solid #3a352f",
  borderRadius: 10,
  color: "#f2ede6",
  fontSize: 13,
};

export default function StatsPage() {
  const session = useRequireSession();
  const [range, setRange] = useState(RANGES[0]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) return;
    setLoading(true);
    (async () => {
      let query = supabase.from("workout_sets").select("reps, weight, muscle_group, workouts!inner(date)");
      if (range.days) {
        const from = new Date();
        from.setDate(from.getDate() - range.days + 1);
        query = query.gte("workouts.date", dateStr(from));
      }
      const { data } = await query;
      setRows(data || []);
      setLoading(false);
    })();
  }, [session, range]);

  if (!session) return <p>로딩 중...</p>;

  const byGroup = {};
  rows.forEach((r) => {
    const g = r.muscle_group || "기타";
    byGroup[g] = (byGroup[g] || 0) + r.reps * r.weight;
  });
  const chartData = Object.entries(byGroup)
    .map(([group, volume]) => ({ group, volume: Math.round(volume) }))
    .sort((a, b) => b.volume - a.volume);

  return (
    <div>
      <h1 style={{ fontSize: 20 }}>부위별 통계</h1>

      <div style={{ display: "flex", gap: 6, marginTop: 12 }}>
        {RANGES.map((r) => (
          <button
            key={r.label}
            onClick={() => setRange(r)}
            style={{
              padding: "6px 12px",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border)",
              background: range.label === r.label ? "var(--accent)" : "var(--bg-elevated)",
              color: range.label === r.label ? "var(--accent-text)" : "var(--text)",
              fontWeight: range.label === r.label ? 600 : 400,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            {r.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ marginTop: 16 }}>불러오는 중...</p>
      ) : chartData.length === 0 ? (
        <p style={{ color: "var(--text-muted)", marginTop: 16 }}>해당 기간에 기록이 없어요.</p>
      ) : (
        <ResponsiveContainer width="100%" height={Math.max(220, chartData.length * 44)}>
          <BarChart data={chartData} layout="vertical" margin={{ left: 16, right: 16 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#3a352f" />
            <XAxis type="number" fontSize={11} stroke="#a89f92" />
            <YAxis type="category" dataKey="group" fontSize={12} width={50} stroke="#a89f92" />
            <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(232,130,90,0.08)" }} />
            <Bar dataKey="volume" fill="#e8825a" radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

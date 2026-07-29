"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import { useRequireSession } from "../../lib/useSession";
import { supabase } from "../../lib/supabaseClient";
import { dateStr } from "../../lib/date";

const RANGES = [
  { label: "최근 7일", days: 7 },
  { label: "최근 30일", days: 30 },
  { label: "전체", days: null },
];

const RADAR_GROUPS = ["가슴", "등", "어깨", "팔", "하체", "코어"];

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
  const setCountByGroup = {};
  rows.forEach((r) => {
    const g = r.muscle_group || "기타";
    byGroup[g] = (byGroup[g] || 0) + r.reps * r.weight;
    setCountByGroup[g] = (setCountByGroup[g] || 0) + 1;
  });
  const chartData = Object.entries(byGroup)
    .map(([group, volume]) => ({ group, volume: Math.round(volume) }))
    .sort((a, b) => b.volume - a.volume);

  const radarData = RADAR_GROUPS.map((group) => ({ group, sets: setCountByGroup[group] || 0 }));
  const hasRadarData = radarData.some((d) => d.sets > 0);
  const radarMax = Math.max(4, ...radarData.map((d) => d.sets));

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

      {!loading && (
        <>
          <h2
            style={{
              fontSize: 13,
              marginTop: 28,
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: 0.4,
            }}
          >
            부위 밸런스 (세트 수)
          </h2>
          {!hasRadarData ? (
            <p style={{ color: "var(--text-muted)", marginTop: 8 }}>해당 기간에 기록이 없어요.</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="#3a352f" />
                <PolarAngleAxis dataKey="group" fontSize={12} stroke="#a89f92" />
                <PolarRadiusAxis domain={[0, radarMax]} tick={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} formatter={(value) => [`${value}세트`, "세트 수"]} />
                <Radar
                  name="세트 수"
                  dataKey="sets"
                  stroke="#e8825a"
                  fill="#e8825a"
                  fillOpacity={0.35}
                  isAnimationActive={false}
                />
              </RadarChart>
            </ResponsiveContainer>
          )}
          <p style={{ fontSize: 11, color: "var(--text-faint)", marginTop: 6 }}>
            부위별 총 세트 수예요. 특정 부위가 유독 작게 나오면 그 부위 비중을 늘려보는 걸 고려해보세요.
          </p>
        </>
      )}
    </div>
  );
}

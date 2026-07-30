"use client";

import { useEffect, useState } from "react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useRequireSession } from "../../lib/useSession";
import { supabase } from "../../lib/supabaseClient";
import { dateStr } from "../../lib/date";
import EmptyState from "../../components/EmptyState";
import { card } from "../../lib/ui";

const RANGES = [
  { label: "7일", days: 7 },
  { label: "30일", days: 30 },
  { label: "전체", days: null },
];

const RADAR_GROUPS = ["가슴", "등", "어깨", "팔", "하체", "코어"];

const tooltipStyle = {
  background: "#363b42",
  border: "1px solid #383d43",
  borderRadius: 10,
  color: "#f0f1f2",
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
  const maxVolume = Math.max(1, ...chartData.map((d) => d.volume));

  // 일반적으로 알려진 부위별 권장 주간 세트 수(10~20세트) 하한을 기간에 비례해 근사한 값. 참고용입니다.
  const recommendedMin = range.days ? Math.round((10 * range.days) / 7) : null;

  const radarData = RADAR_GROUPS.map((group) => ({
    group,
    sets: setCountByGroup[group] || 0,
    recommended: recommendedMin,
  }));
  const hasRadarData = radarData.some((d) => d.sets > 0);
  const radarMax = Math.max(4, recommendedMin || 0, ...radarData.map((d) => d.sets));

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase" }}>
          Body Metrics
        </span>
        <span className="mono" style={{ fontSize: 10.5, color: "var(--text-muted)" }}>
          {dateStr(new Date()).replaceAll("-", ".")}
        </span>
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
        {RANGES.map((r) => (
          <button
            key={r.label}
            onClick={() => setRange(r)}
            style={{
              flex: 1,
              textAlign: "center",
              padding: "9px 0",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border-strong)",
              background: range.label === r.label ? "var(--accent)" : "transparent",
              color: range.label === r.label ? "#fff" : "var(--text-muted)",
              fontWeight: range.label === r.label ? 700 : 600,
              fontSize: 12.5,
              boxShadow: range.label === r.label ? "0 3px 12px var(--accent-glow)" : "none",
              cursor: "pointer",
            }}
          >
            {r.label}
          </button>
        ))}
      </div>

      <div style={{ marginTop: 20 }}>
        <span className="eyebrow">Volume by Group</span>
        <div style={{ ...card, padding: "14px 16px" }}>
          {loading ? (
            <p style={{ margin: 0, color: "var(--text-muted)", fontSize: 13 }}>불러오는 중...</p>
          ) : chartData.length === 0 ? (
            <EmptyState message="해당 기간에 기록이 없어요." />
          ) : (
            chartData.map((d, i) => (
              <div
                key={d.group}
                style={{ display: "flex", alignItems: "center", gap: 10, marginTop: i === 0 ? 0 : 12 }}
              >
                <span style={{ width: 34, fontSize: 12, color: "var(--text-muted)", flexShrink: 0 }}>{d.group}</span>
                <div style={{ flex: 1, height: 16, background: "var(--border)", borderRadius: 3, overflow: "hidden" }}>
                  <div
                    style={{
                      height: "100%",
                      width: `${(d.volume / maxVolume) * 100}%`,
                      background: "var(--accent)",
                      borderRadius: 3,
                      boxShadow: "0 0 10px var(--accent-glow)",
                    }}
                  />
                </div>
                <span className="mono" style={{ width: 64, textAlign: "right", fontSize: 11.5, color: "var(--text)", flexShrink: 0 }}>
                  {d.volume.toLocaleString()}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {!loading && (
        <div style={{ marginTop: 20 }}>
          <span className="eyebrow">Balance · Set Count</span>
          <div style={{ ...card, padding: 16 }}>
            {!hasRadarData ? (
              <EmptyState message="해당 기간에 기록이 없어요." />
            ) : (
              <>
                <ResponsiveContainer width="100%" height={260}>
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                    <PolarGrid stroke="#383d43" />
                    <PolarAngleAxis dataKey="group" fontSize={12} stroke="#8a9096" />
                    <PolarRadiusAxis domain={[0, radarMax]} tick={false} axisLine={false} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(value, name) => [`${value}세트`, name]} />
                    {recommendedMin != null && (
                      <Radar
                        name="권장 최소"
                        dataKey="recommended"
                        stroke="#8a9096"
                        strokeDasharray="4 3"
                        fill="none"
                        isAnimationActive={false}
                      />
                    )}
                    <Radar
                      name="내 세트 수"
                      dataKey="sets"
                      stroke="#2c6dff"
                      fill="#2c6dff"
                      fillOpacity={0.28}
                      isAnimationActive={false}
                    />
                  </RadarChart>
                </ResponsiveContainer>
                <div style={{ display: "flex", gap: 16, marginTop: 4, fontSize: 11, color: "var(--text-muted)" }}>
                  <span>
                    <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 2, background: "var(--accent)", marginRight: 5, verticalAlign: -1 }} />
                    내 세트 수
                  </span>
                  {recommendedMin != null && (
                    <span>
                      <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 2, border: "1px dashed var(--text-faint)", marginRight: 5, verticalAlign: -1 }} />
                      권장 최소
                    </span>
                  )}
                </div>
              </>
            )}
          </div>
          <p style={{ fontSize: 11, color: "var(--text-faint)", marginTop: 6 }}>
            부위별 총 세트 수예요{recommendedMin != null && `. 점선은 일반적으로 권장되는 최소 세트 수(주당 10세트 기준 근사치)예요`}.
          </p>
        </div>
      )}
    </div>
  );
}

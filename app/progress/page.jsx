"use client";

import { useEffect, useMemo, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useRequireSession } from "../../lib/useSession";
import { supabase } from "../../lib/supabaseClient";
import { inputStyle, card, sectionLabel as baseSectionLabel } from "../../lib/ui";
import { estimate1RM } from "../../lib/oneRepMax";
import EmptyState from "../../components/EmptyState";

const sectionLabel = { ...baseSectionLabel, marginTop: 24 };

const tooltipStyle = {
  background: "#363b42",
  border: "1px solid #383d43",
  borderRadius: 10,
  color: "#f0f1f2",
  fontSize: 13,
};

export default function ProgressPage() {
  const session = useRequireSession();
  const [exerciseNames, setExerciseNames] = useState([]);
  const [selected, setSelected] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!session) return;
    (async () => {
      const { data } = await supabase.from("workout_sets").select("exercise_name");
      const names = Array.from(new Set((data || []).map((d) => d.exercise_name))).sort();
      setExerciseNames(names);
      if (names.length) setSelected(names[0]);
    })();
  }, [session]);

  useEffect(() => {
    if (!session || !selected) return;
    setLoading(true);
    (async () => {
      const { data } = await supabase
        .from("workout_sets")
        .select("reps, weight, workouts(date)")
        .eq("exercise_name", selected);
      setRows(data || []);
      setLoading(false);
    })();
  }, [session, selected]);

  const chartData = useMemo(() => {
    const byDate = {};
    rows.forEach((r) => {
      const date = r.workouts?.date;
      if (!date) return;
      if (!byDate[date]) byDate[date] = { date, maxWeight: 0, volume: 0 };
      byDate[date].maxWeight = Math.max(byDate[date].maxWeight, r.weight);
      byDate[date].volume += r.reps * r.weight;
    });
    return Object.values(byDate).sort((a, b) => a.date.localeCompare(b.date));
  }, [rows]);

  const best1RM = useMemo(() => {
    return rows.reduce((max, r) => Math.max(max, estimate1RM(r.weight, r.reps)), 0);
  }, [rows]);

  if (!session) return <p>로딩 중...</p>;

  return (
    <div>
      <h1 style={{ fontSize: 20 }}>진행 그래프</h1>
      {exerciseNames.length === 0 ? (
        <EmptyState message="아직 기록된 운동이 없어요. 먼저 운동을 기록해보세요." />
      ) : (
        <>
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            style={{ ...inputStyle, marginTop: 12 }}
          >
            {exerciseNames.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>

          {best1RM > 0 && (
            <div style={{ ...card, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 13, color: "var(--text-muted)" }}>예상 1RM</span>
              <strong style={{ fontSize: 20, color: "var(--accent)" }}>{best1RM}kg</strong>
            </div>
          )}

          {loading ? (
            <p>불러오는 중...</p>
          ) : chartData.length < 2 ? (
            <p style={{ color: "var(--text-muted)", marginTop: 16 }}>
              그래프를 그리려면 같은 종목을 2번 이상 기록해주세요.
            </p>
          ) : (
            <>
              <h2 style={sectionLabel}>최고 무게 (kg)</h2>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#383d43" />
                  <XAxis dataKey="date" fontSize={11} stroke="#8a9096" />
                  <YAxis fontSize={11} stroke="#8a9096" />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Line type="monotone" dataKey="maxWeight" stroke="#2c6dff" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>

              <h2 style={sectionLabel}>총 볼륨 (횟수 × 무게 합)</h2>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#383d43" />
                  <XAxis dataKey="date" fontSize={11} stroke="#8a9096" />
                  <YAxis fontSize={11} stroke="#8a9096" />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Line type="monotone" dataKey="volume" stroke="#3ddc9a" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </>
          )}
        </>
      )}
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useRequireSession } from "../../lib/useSession";
import { supabase } from "../../lib/supabaseClient";
import { inputStyle } from "../../lib/ui";

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

  if (!session) return <p>로딩 중...</p>;

  return (
    <div>
      <h1 style={{ fontSize: 20 }}>진행 그래프</h1>
      {exerciseNames.length === 0 ? (
        <p style={{ color: "#888", marginTop: 12 }}>아직 기록된 운동이 없어요. 먼저 운동을 기록해보세요.</p>
      ) : (
        <>
          <select value={selected} onChange={(e) => setSelected(e.target.value)} style={{ ...inputStyle, marginTop: 12 }}>
            {exerciseNames.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>

          {loading ? (
            <p>불러오는 중...</p>
          ) : chartData.length < 2 ? (
            <p style={{ color: "#888", marginTop: 16 }}>그래프를 그리려면 같은 종목을 2번 이상 기록해주세요.</p>
          ) : (
            <>
              <h2 style={{ fontSize: 14, marginTop: 24, color: "#666" }}>최고 무게 (kg)</h2>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" fontSize={11} />
                  <YAxis fontSize={11} />
                  <Tooltip />
                  <Line type="monotone" dataKey="maxWeight" stroke="#111" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>

              <h2 style={{ fontSize: 14, marginTop: 24, color: "#666" }}>총 볼륨 (횟수 × 무게 합)</h2>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" fontSize={11} />
                  <YAxis fontSize={11} />
                  <Tooltip />
                  <Line type="monotone" dataKey="volume" stroke="#0070f3" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </>
          )}
        </>
      )}
    </div>
  );
}

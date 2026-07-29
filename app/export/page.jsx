"use client";

import { useState } from "react";
import { useRequireSession } from "../../lib/useSession";
import { supabase } from "../../lib/supabaseClient";
import { card, primaryBtn } from "../../lib/ui";
import { downloadCsv } from "../../lib/exportCsv";
import { todayStr } from "../../lib/date";

export default function ExportPage() {
  const session = useRequireSession();
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState("");

  if (!session) return <p>로딩 중...</p>;

  const exportWorkouts = async () => {
    setLoading("workouts");
    setError("");
    const { data, error: err } = await supabase
      .from("workout_sets")
      .select("exercise_name, muscle_group, set_index, reps, weight, rpe, tag, workouts(date, routines(name))")
      .order("created_at");
    setLoading(null);
    if (err) {
      setError("운동 기록을 불러오지 못했습니다: " + err.message);
      return;
    }
    if (!data || data.length === 0) {
      setError("내보낼 운동 기록이 없습니다.");
      return;
    }
    const rows = data
      .slice()
      .sort((a, b) => (a.workouts?.date || "").localeCompare(b.workouts?.date || ""))
      .map((s) => [
        s.workouts?.date || "",
        s.workouts?.routines?.name || "",
        s.exercise_name,
        s.muscle_group || "",
        s.set_index,
        s.reps,
        s.weight,
        s.rpe ?? "",
        s.tag || "",
      ]);
    downloadCsv(
      `workout-log_${todayStr()}.csv`,
      ["날짜", "루틴", "종목", "부위", "세트", "횟수", "무게(kg)", "RPE", "태그"],
      rows
    );
  };

  const exportBodyWeights = async () => {
    setLoading("weights");
    setError("");
    const { data, error: err } = await supabase
      .from("body_weights")
      .select("date, weight, skeletal_muscle_mass, body_fat_percent")
      .order("date");
    setLoading(null);
    if (err) {
      setError("체중 기록을 불러오지 못했습니다: " + err.message);
      return;
    }
    if (!data || data.length === 0) {
      setError("내보낼 체중 기록이 없습니다.");
      return;
    }
    const rows = data.map((w) => [w.date, w.weight, w.skeletal_muscle_mass ?? "", w.body_fat_percent ?? ""]);
    downloadCsv(
      `body-weight_${todayStr()}.csv`,
      ["날짜", "체중(kg)", "골격근량(kg)", "체지방률(%)"],
      rows
    );
  };

  return (
    <div>
      <h1 style={{ fontSize: 20 }}>데이터 내보내기</h1>
      <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 6 }}>
        기록한 데이터를 CSV 파일로 내려받아 엑셀 등에서 확인할 수 있습니다.
      </p>

      <div style={card}>
        <div style={{ fontWeight: 600, marginBottom: 4 }}>운동 기록</div>
        <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 12 }}>
          날짜별 세트/횟수/무게/RPE/태그 전체
        </div>
        <button style={primaryBtn} onClick={exportWorkouts} disabled={loading !== null}>
          {loading === "workouts" ? "내보내는 중..." : "운동 기록 CSV 다운로드"}
        </button>
      </div>

      <div style={card}>
        <div style={{ fontWeight: 600, marginBottom: 4 }}>체중·체성분 기록</div>
        <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 12 }}>
          날짜별 체중/골격근량/체지방률
        </div>
        <button style={primaryBtn} onClick={exportBodyWeights} disabled={loading !== null}>
          {loading === "weights" ? "내보내는 중..." : "체중 기록 CSV 다운로드"}
        </button>
      </div>

      {error && (
        <p style={{ color: "var(--danger)", fontSize: 13, marginTop: 10 }}>{error}</p>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useRequireSession } from "../../lib/useSession";
import { supabase } from "../../lib/supabaseClient";
import { inputStyle, primaryBtn, smallBtn, card } from "../../lib/ui";
import { todayStr } from "../../lib/date";

const tooltipStyle = {
  background: "#2f2b28",
  border: "1px solid #3a352f",
  borderRadius: 10,
  color: "#f2ede6",
  fontSize: 13,
};

const sectionLabel = {
  fontSize: 13,
  marginTop: 24,
  color: "var(--text-muted)",
  textTransform: "uppercase",
  letterSpacing: 0.4,
};

const smallLabel = { display: "block", fontSize: 12, color: "var(--text-muted)", marginBottom: 4 };

export default function WeightPage() {
  const session = useRequireSession();
  const [entries, setEntries] = useState([]);
  const [date, setDate] = useState(todayStr());
  const [weight, setWeight] = useState("");
  const [muscle, setMuscle] = useState("");
  const [fat, setFat] = useState("");
  const [showComposition, setShowComposition] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const [goal, setGoal] = useState(null);
  const [goalWeight, setGoalWeight] = useState("");
  const [goalMuscle, setGoalMuscle] = useState("");
  const [goalFat, setGoalFat] = useState("");
  const [editingGoal, setEditingGoal] = useState(false);
  const [goalSaving, setGoalSaving] = useState(false);

  const load = async () => {
    const [{ data }, { data: goalData }] = await Promise.all([
      supabase
        .from("body_weights")
        .select("id, date, weight, skeletal_muscle_mass, body_fat_percent")
        .order("date", { ascending: true }),
      supabase.from("goals").select("target_weight, target_skeletal_muscle, target_body_fat").maybeSingle(),
    ]);
    setEntries(data || []);
    setGoal(goalData || null);
    setGoalWeight(goalData?.target_weight ?? "");
    setGoalMuscle(goalData?.target_skeletal_muscle ?? "");
    setGoalFat(goalData?.target_body_fat ?? "");
    setLoading(false);
  };

  useEffect(() => {
    if (session) load();
  }, [session]);

  if (!session) return <p>로딩 중...</p>;

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    if (weight === "") {
      setError("몸무게를 입력해주세요.");
      return;
    }
    setSaving(true);
    try {
      const { error: err } = await supabase.from("body_weights").upsert(
        {
          user_id: session.user.id,
          date,
          weight: Number(weight),
          skeletal_muscle_mass: muscle !== "" ? Number(muscle) : null,
          body_fat_percent: fat !== "" ? Number(fat) : null,
        },
        { onConflict: "user_id,date" }
      );
      if (err) throw err;
      setWeight("");
      setMuscle("");
      setFat("");
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    await supabase.from("body_weights").delete().eq("id", id);
    load();
  };

  const handleSaveGoal = async () => {
    setGoalSaving(true);
    try {
      const { error: err } = await supabase.from("goals").upsert(
        {
          user_id: session.user.id,
          target_weight: goalWeight !== "" ? Number(goalWeight) : null,
          target_skeletal_muscle: goalMuscle !== "" ? Number(goalMuscle) : null,
          target_body_fat: goalFat !== "" ? Number(goalFat) : null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );
      if (err) throw err;
      setEditingGoal(false);
      await load();
    } finally {
      setGoalSaving(false);
    }
  };

  const chartData = entries.map((e) => ({ date: e.date, weight: e.weight }));
  const muscleData = entries.filter((e) => e.skeletal_muscle_mass != null).map((e) => ({ date: e.date, value: e.skeletal_muscle_mass }));
  const fatData = entries.filter((e) => e.body_fat_percent != null).map((e) => ({ date: e.date, value: e.body_fat_percent }));
  const recent = [...entries].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 10);
  const latest = recent[0];

  const hasGoal = goal && (goal.target_weight || goal.target_skeletal_muscle || goal.target_body_fat);

  return (
    <div>
      <h1 style={{ fontSize: 20 }}>체중 · 체성분 기록</h1>

      <form onSubmit={handleSave} style={{ ...card, display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ flex: 1 }}>
            <label style={smallLabel}>날짜</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={inputStyle} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={smallLabel}>몸무게(kg)</label>
            <input type="number" step="0.1" value={weight} onChange={(e) => setWeight(e.target.value)} style={inputStyle} />
          </div>
        </div>

        {showComposition ? (
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ flex: 1 }}>
              <label style={smallLabel}>골격근량(kg)</label>
              <input type="number" step="0.1" value={muscle} onChange={(e) => setMuscle(e.target.value)} style={inputStyle} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={smallLabel}>체지방률(%)</label>
              <input type="number" step="0.1" value={fat} onChange={(e) => setFat(e.target.value)} style={inputStyle} />
            </div>
          </div>
        ) : (
          <button type="button" onClick={() => setShowComposition(true)} style={{ ...smallBtn, alignSelf: "flex-start" }}>
            + 인바디 체성분 추가 입력
          </button>
        )}

        <button type="submit" disabled={saving} style={primaryBtn}>
          {saving ? "저장 중..." : "저장"}
        </button>
      </form>
      {error && <p style={{ color: "var(--danger)", fontSize: 13, marginTop: 8 }}>{error}</p>}

      <h2 style={sectionLabel}>목표</h2>
      {editingGoal ? (
        <div style={{ ...card, display: "flex", flexDirection: "column", gap: 8 }}>
          <div>
            <label style={smallLabel}>목표 체중(kg)</label>
            <input type="number" step="0.1" value={goalWeight} onChange={(e) => setGoalWeight(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={smallLabel}>목표 골격근량(kg)</label>
            <input type="number" step="0.1" value={goalMuscle} onChange={(e) => setGoalMuscle(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={smallLabel}>목표 체지방률(%)</label>
            <input type="number" step="0.1" value={goalFat} onChange={(e) => setGoalFat(e.target.value)} style={inputStyle} />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={handleSaveGoal} disabled={goalSaving} style={{ ...primaryBtn, flex: 1 }}>
              {goalSaving ? "저장 중..." : "목표 저장"}
            </button>
            <button onClick={() => setEditingGoal(false)} style={{ ...smallBtn, flex: 1 }}>
              취소
            </button>
          </div>
        </div>
      ) : hasGoal ? (
        <div style={card}>
          {goal.target_weight && (
            <GoalRow label="체중" current={latest?.weight} target={goal.target_weight} unit="kg" direction="neutral" />
          )}
          {goal.target_skeletal_muscle && (
            <GoalRow
              label="골격근량"
              current={latest?.skeletal_muscle_mass}
              target={goal.target_skeletal_muscle}
              unit="kg"
              direction="higher"
            />
          )}
          {goal.target_body_fat && (
            <GoalRow
              label="체지방률"
              current={latest?.body_fat_percent}
              target={goal.target_body_fat}
              unit="%"
              direction="lower"
            />
          )}
          <button onClick={() => setEditingGoal(true)} style={{ ...smallBtn, marginTop: 4 }}>
            목표 수정
          </button>
        </div>
      ) : (
        <button onClick={() => setEditingGoal(true)} style={{ ...smallBtn, marginTop: 8 }}>
          + 목표 설정하기
        </button>
      )}

      {loading ? (
        <p style={{ marginTop: 16 }}>불러오는 중...</p>
      ) : chartData.length < 2 ? (
        <p style={{ color: "var(--text-muted)", marginTop: 16 }}>2번 이상 기록하면 그래프가 나와요.</p>
      ) : (
        <>
          <h2 style={sectionLabel}>체중</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#3a352f" />
              <XAxis dataKey="date" fontSize={11} stroke="#a89f92" />
              <YAxis fontSize={11} domain={["auto", "auto"]} stroke="#a89f92" />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="weight" stroke="#e8825a" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>

          {muscleData.length >= 2 && (
            <>
              <h2 style={sectionLabel}>골격근량</h2>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={muscleData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#3a352f" />
                  <XAxis dataKey="date" fontSize={11} stroke="#a89f92" />
                  <YAxis fontSize={11} domain={["auto", "auto"]} stroke="#a89f92" />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Line type="monotone" dataKey="value" stroke="#5aa9a3" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </>
          )}

          {fatData.length >= 2 && (
            <>
              <h2 style={sectionLabel}>체지방률</h2>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={fatData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#3a352f" />
                  <XAxis dataKey="date" fontSize={11} stroke="#a89f92" />
                  <YAxis fontSize={11} domain={["auto", "auto"]} stroke="#a89f92" />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Line type="monotone" dataKey="value" stroke="#e2574c" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </>
          )}
        </>
      )}

      <h2 style={sectionLabel}>최근 기록</h2>
      {recent.length === 0 ? (
        <p style={{ color: "var(--text-muted)" }}>아직 기록이 없어요.</p>
      ) : (
        recent.map((e) => (
          <div key={e.id} style={{ ...card, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>{e.date}</span>
            <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
              {e.weight}kg
              {e.skeletal_muscle_mass != null && ` · 근육 ${e.skeletal_muscle_mass}kg`}
              {e.body_fat_percent != null && ` · 체지방 ${e.body_fat_percent}%`}
            </span>
            <button onClick={() => handleDelete(e.id)} style={{ ...smallBtn, color: "var(--danger)" }}>
              삭제
            </button>
          </div>
        ))
      )}
    </div>
  );
}

function GoalRow({ label, current, target, unit, direction }) {
  const hasCurrent = current !== undefined && current !== null;
  const diff = hasCurrent ? Math.round((target - current) * 10) / 10 : null;
  const isEqual = hasCurrent && Math.abs(diff) < 0.05;

  let reached = isEqual;
  if (!isEqual && hasCurrent) {
    if (direction === "higher") reached = current >= target;
    else if (direction === "lower") reached = current <= target;
  }

  const statusText = reached
    ? "달성!"
    : direction === "neutral"
      ? `${Math.abs(diff)}${unit} 차이`
      : `${Math.abs(diff)}${unit} 남음`;

  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0" }}>
      <span style={{ fontSize: 13, color: "var(--text-muted)" }}>{label}</span>
      <span style={{ fontSize: 13 }}>
        {hasCurrent ? `${current}${unit}` : "—"}
        <span style={{ color: "var(--text-faint)" }}> → 목표 {target}{unit}</span>
        {hasCurrent && (
          <span style={{ marginLeft: 6, color: reached ? "var(--success)" : "var(--accent)", fontWeight: 600 }}>
            {statusText}
          </span>
        )}
      </span>
    </div>
  );
}

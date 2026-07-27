"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useRequireSession } from "../../../lib/useSession";
import { useExerciseStats } from "../../../lib/useExerciseStats";
import { supabase } from "../../../lib/supabaseClient";
import { inputStyle, primaryBtn, smallBtn, card } from "../../../lib/ui";
import RestTimer from "../../../components/RestTimer";

function todayStr() {
  const d = new Date();
  const off = d.getTimezoneOffset();
  const local = new Date(d.getTime() - off * 60000);
  return local.toISOString().slice(0, 10);
}

function emptyExercise(name = "") {
  return { name, sets: [{ reps: "", weight: "" }] };
}

export default function NewWorkoutPage() {
  const session = useRequireSession();
  const router = useRouter();
  const { names: exerciseNames, prMap } = useExerciseStats(session);
  const [routines, setRoutines] = useState([]);
  const [routineId, setRoutineId] = useState("");
  const [date, setDate] = useState(todayStr());
  const [exercises, setExercises] = useState([emptyExercise()]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!session) return;
    (async () => {
      const { data } = await supabase
        .from("routines")
        .select("id, name, routine_exercises(id, name, order_index)")
        .order("created_at", { ascending: false });
      setRoutines(data || []);
    })();
  }, [session]);

  if (!session) return <p>로딩 중...</p>;

  const handleRoutineChange = (id) => {
    setRoutineId(id);
    if (!id) {
      setExercises([emptyExercise()]);
      return;
    }
    const r = routines.find((r) => r.id === id);
    const sorted = [...(r?.routine_exercises || [])].sort((a, b) => a.order_index - b.order_index);
    setExercises(sorted.length ? sorted.map((ex) => emptyExercise(ex.name)) : [emptyExercise()]);
  };

  const updateExerciseName = (i, value) => {
    const next = [...exercises];
    next[i] = { ...next[i], name: value };
    setExercises(next);
  };

  const addExercise = () => setExercises([...exercises, emptyExercise()]);
  const removeExercise = (i) => setExercises(exercises.filter((_, idx) => idx !== i));

  const addSet = (exIdx) => {
    const next = [...exercises];
    next[exIdx] = { ...next[exIdx], sets: [...next[exIdx].sets, { reps: "", weight: "" }] };
    setExercises(next);
  };
  const removeSet = (exIdx, setIdx) => {
    const next = [...exercises];
    next[exIdx] = { ...next[exIdx], sets: next[exIdx].sets.filter((_, i) => i !== setIdx) };
    setExercises(next);
  };
  const updateSet = (exIdx, setIdx, field, value) => {
    const next = [...exercises];
    const sets = [...next[exIdx].sets];
    sets[setIdx] = { ...sets[setIdx], [field]: value };
    next[exIdx] = { ...next[exIdx], sets };
    setExercises(next);
  };

  const handleSave = async () => {
    setError("");
    const rows = [];
    exercises.forEach((ex) => {
      const exName = ex.name.trim();
      if (!exName) return;
      ex.sets.forEach((s, idx) => {
        if (s.reps === "" || s.weight === "") return;
        rows.push({
          exercise_name: exName,
          set_index: idx,
          reps: Number(s.reps),
          weight: Number(s.weight),
        });
      });
    });
    if (rows.length === 0) {
      setError("최소 한 세트는 종목/횟수/무게를 모두 입력해주세요.");
      return;
    }
    setSaving(true);
    try {
      const { data: workout, error: wErr } = await supabase
        .from("workouts")
        .insert({ user_id: session.user.id, routine_id: routineId || null, date })
        .select()
        .single();
      if (wErr) throw wErr;

      const setsToInsert = rows.map((r) => ({ ...r, workout_id: workout.id }));
      const { error: sErr } = await supabase.from("workout_sets").insert(setsToInsert);
      if (sErr) throw sErr;

      router.push("/history");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 style={{ fontSize: 20 }}>운동 기록</h1>

      <div style={card}>
        <label style={labelStyle}>날짜</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={inputStyle} />

        <label style={{ ...labelStyle, marginTop: 12 }}>루틴 선택 (선택 안 하면 자유 기록)</label>
        <select value={routineId} onChange={(e) => handleRoutineChange(e.target.value)} style={inputStyle}>
          <option value="">자유 기록</option>
          {routines.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
      </div>

      <RestTimer />

      <datalist id="exercise-names">
        {exerciseNames.map((n) => (
          <option key={n} value={n} />
        ))}
      </datalist>

      {exercises.map((ex, exIdx) => {
        const pr = prMap[ex.name.trim()];
        return (
          <div key={exIdx} style={card}>
            <div style={{ display: "flex", gap: 6 }}>
              <input
                placeholder="운동 종목 (예: 벤치프레스)"
                value={ex.name}
                onChange={(e) => updateExerciseName(exIdx, e.target.value)}
                list="exercise-names"
                style={{ ...inputStyle, flex: 1 }}
              />
              {exercises.length > 1 && (
                <button onClick={() => removeExercise(exIdx)} style={smallBtn}>
                  종목 삭제
                </button>
              )}
            </div>

            {pr !== undefined && (
              <p style={{ fontSize: 12, color: "#888", margin: "6px 0 0" }}>개인 최고 기록: {pr}kg</p>
            )}

            <div style={{ marginTop: 10 }}>
              {ex.sets.map((s, setIdx) => {
                const isNewPR = pr !== undefined && s.weight !== "" && Number(s.weight) > pr;
                return (
                  <div key={setIdx} style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 6 }}>
                    <span style={{ width: 40, fontSize: 13, color: "#888" }}>{setIdx + 1}세트</span>
                    <input
                      type="number"
                      placeholder="횟수"
                      value={s.reps}
                      onChange={(e) => updateSet(exIdx, setIdx, "reps", e.target.value)}
                      style={{ ...inputStyle, flex: 1 }}
                    />
                    <input
                      type="number"
                      step="0.5"
                      placeholder="무게(kg)"
                      value={s.weight}
                      onChange={(e) => updateSet(exIdx, setIdx, "weight", e.target.value)}
                      style={{ ...inputStyle, flex: 1, borderColor: isNewPR ? "#0a0" : undefined }}
                    />
                    {isNewPR && <span style={{ fontSize: 12, color: "#0a0", whiteSpace: "nowrap" }}>신기록!</span>}
                    {ex.sets.length > 1 && (
                      <button onClick={() => removeSet(exIdx, setIdx)} style={smallBtn}>
                        X
                      </button>
                    )}
                  </div>
                );
              })}
              <button onClick={() => addSet(exIdx)} style={{ ...smallBtn, marginTop: 8 }}>
                + 세트 추가
              </button>
            </div>
          </div>
        );
      })}

      <button onClick={addExercise} style={{ ...smallBtn, marginTop: 12 }}>
        + 종목 추가
      </button>

      {error && <p style={{ color: "#c00", fontSize: 13, marginTop: 12 }}>{error}</p>}

      <button onClick={handleSave} disabled={saving} style={{ ...primaryBtn, width: "100%", marginTop: 16 }}>
        {saving ? "저장 중..." : "기록 저장"}
      </button>
    </div>
  );
}

const labelStyle = { display: "block", fontSize: 13, color: "#666", marginBottom: 6 };

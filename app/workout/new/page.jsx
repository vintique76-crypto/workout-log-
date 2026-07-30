"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useRequireSession } from "../../../lib/useSession";
import { useExerciseStats } from "../../../lib/useExerciseStats";
import { useLastSessionSets } from "../../../lib/useLastSessionSets";
import { supabase } from "../../../lib/supabaseClient";
import { inputStyle, primaryBtn, smallBtn, card } from "../../../lib/ui";
import { todayStr } from "../../../lib/date";
import { MUSCLE_GROUPS } from "../../../lib/muscleGroups";
import RestTimer from "../../../components/RestTimer";
import MoveIconBadge from "../../../components/MoveIconBadge";
import ExercisePicker from "../../../components/ExercisePicker";
import SetTagPicker from "../../../components/SetTagPicker";
import ShareWorkoutModal from "../../../components/ShareWorkoutModal";
import { buildShareData } from "../../../lib/shareWorkout";
import { suggestNextTarget } from "../../../lib/overloadSuggestion";

const stepperBtnStyle = {
  width: 34,
  height: 34,
  borderRadius: "var(--radius-sm)",
  border: "1px solid var(--border-strong)",
  background: "transparent",
  color: "var(--text)",
  fontSize: 17,
  fontWeight: 700,
  cursor: "pointer",
  flexShrink: 0,
};

const smallIconBtn = {
  padding: "4px 8px",
  borderRadius: "var(--radius-sm)",
  border: "1px solid var(--border-strong)",
  background: "transparent",
  color: "var(--text-muted)",
  fontSize: 11.5,
  fontWeight: 600,
  cursor: "pointer",
};

const ghostAddBtn = {
  width: "100%",
  textAlign: "center",
  padding: 10,
  fontSize: 12,
  color: "var(--text-muted)",
  border: "1px dashed var(--border-strong)",
  borderRadius: "var(--radius-sm)",
  background: "transparent",
  cursor: "pointer",
};

function emptySet() {
  return { reps: "", weight: "", completed: false, rpe: null, tag: null };
}

function emptyExercise(name = "", muscleGroup = "기타") {
  return { name, muscleGroup, sets: [emptySet()] };
}

export default function NewWorkoutPage() {
  return (
    <Suspense fallback={<p>로딩 중...</p>}>
      <NewWorkoutPageInner />
    </Suspense>
  );
}

function NewWorkoutPageInner() {
  const session = useRequireSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { names: exerciseNames, prMap } = useExerciseStats(session);
  const { lastSessionMap } = useLastSessionSets(session);
  const [routines, setRoutines] = useState([]);
  const [routineId, setRoutineId] = useState("");
  const [date, setDate] = useState(todayStr());
  const [exercises, setExercises] = useState([emptyExercise()]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [pickerIndex, setPickerIndex] = useState(null);
  const [tagPicker, setTagPicker] = useState(null);
  const [timerSignal, setTimerSignal] = useState(0);
  const [shareData, setShareData] = useState(null);
  const [startedAt] = useState(() => Date.now());

  useEffect(() => {
    if (!session) return;
    (async () => {
      const { data } = await supabase
        .from("routines")
        .select("id, name, routine_exercises(id, name, order_index, muscle_group)")
        .order("created_at", { ascending: false });
      setRoutines(data || []);

      const preselect = searchParams.get("routine");
      const preselectRoutine = preselect ? (data || []).find((r) => r.id === preselect) : null;
      if (preselectRoutine) {
        setRoutineId(preselect);
        const sorted = [...(preselectRoutine.routine_exercises || [])].sort(
          (a, b) => a.order_index - b.order_index
        );
        setExercises(
          sorted.length ? sorted.map((ex) => emptyExercise(ex.name, ex.muscle_group || "기타")) : [emptyExercise()]
        );
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    setExercises(
      sorted.length ? sorted.map((ex) => emptyExercise(ex.name, ex.muscle_group || "기타")) : [emptyExercise()]
    );
  };

  const updateExerciseName = (i, value) => {
    setExercises((prev) => prev.map((ex, idx) => (idx === i ? { ...ex, name: value } : ex)));
  };

  const updateExerciseMuscleGroup = (i, value) => {
    setExercises((prev) => prev.map((ex, idx) => (idx === i ? { ...ex, muscleGroup: value } : ex)));
  };

  const addExercise = () => setExercises([...exercises, emptyExercise()]);
  const removeExercise = (i) => setExercises(exercises.filter((_, idx) => idx !== i));

  const addSet = (exIdx) => {
    setExercises((prev) =>
      prev.map((ex, i) => (i === exIdx ? { ...ex, sets: [...ex.sets, emptySet()] } : ex))
    );
  };
  const removeSet = (exIdx, setIdx) => {
    setExercises((prev) =>
      prev.map((ex, i) => (i === exIdx ? { ...ex, sets: ex.sets.filter((_, j) => j !== setIdx) } : ex))
    );
  };
  const updateSet = (exIdx, setIdx, field, value) => {
    setExercises((prev) =>
      prev.map((ex, i) =>
        i === exIdx
          ? { ...ex, sets: ex.sets.map((s, j) => (j === setIdx ? { ...s, [field]: value } : s)) }
          : ex
      )
    );
  };

  const stepSet = (exIdx, setIdx, field, delta) => {
    setExercises((prev) =>
      prev.map((ex, i) => {
        if (i !== exIdx) return ex;
        const ghost = lastSessionMap[ex.name.trim()]?.[setIdx];
        const sets = ex.sets.map((s, j) => {
          if (j !== setIdx) return s;
          const raw = s[field];
          const base = raw !== "" ? Number(raw) : ghost ? Number(ghost[field]) : 0;
          let next = base + delta;
          if (next < 0) next = 0;
          next = Math.round(next * 10) / 10;
          return { ...s, [field]: String(next) };
        });
        return { ...ex, sets };
      })
    );
  };

  const toggleComplete = (exIdx, setIdx) => {
    const ex = exercises[exIdx];
    const current = ex.sets[setIdx];
    const willComplete = !current.completed;
    const ghost = lastSessionMap[ex.name.trim()]?.[setIdx];

    setExercises((prev) =>
      prev.map((e, i) => {
        if (i !== exIdx) return e;
        const sets = e.sets.map((s, j) => {
          if (j !== setIdx) return s;
          const reps = s.reps !== "" ? s.reps : willComplete && ghost ? String(ghost.reps) : s.reps;
          const weight = s.weight !== "" ? s.weight : willComplete && ghost ? String(ghost.weight) : s.weight;
          return { ...s, reps, weight, completed: willComplete };
        });
        return { ...e, sets };
      })
    );

    if (willComplete) {
      if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(25);
      setTimerSignal((t) => t + 1);
    }
  };

  const updateSetRpe = (exIdx, setIdx, value) => {
    setExercises((prev) =>
      prev.map((e, i) =>
        i === exIdx ? { ...e, sets: e.sets.map((s, j) => (j === setIdx ? { ...s, rpe: value } : s)) } : e
      )
    );
  };
  const updateSetTag = (exIdx, setIdx, value) => {
    setExercises((prev) =>
      prev.map((e, i) =>
        i === exIdx ? { ...e, sets: e.sets.map((s, j) => (j === setIdx ? { ...s, tag: value } : s)) } : e
      )
    );
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
          muscle_group: ex.muscleGroup,
          set_index: idx,
          reps: Number(s.reps),
          weight: Number(s.weight),
          rpe: s.rpe,
          tag: s.tag,
        });
      });
    });
    if (rows.length === 0) {
      setError("최소 한 세트는 종목/횟수/무게를 모두 입력해주세요.");
      return;
    }
    setSaving(true);
    try {
      const durationSeconds = Math.round((Date.now() - startedAt) / 1000);
      const { data: workout, error: wErr } = await supabase
        .from("workouts")
        .insert({
          user_id: session.user.id,
          routine_id: routineId || null,
          date,
          duration_seconds: durationSeconds,
        })
        .select()
        .single();
      if (wErr) throw wErr;

      const setsToInsert = rows.map((r) => ({ ...r, workout_id: workout.id }));
      const { error: sErr } = await supabase.from("workout_sets").insert(setsToInsert);
      if (sErr) throw sErr;

      const grouped = {};
      const order = [];
      rows.forEach((r) => {
        if (!grouped[r.exercise_name]) {
          grouped[r.exercise_name] = [];
          order.push(r.exercise_name);
        }
        grouped[r.exercise_name].push({ reps: r.reps, weight: r.weight });
      });
      const exerciseGroups = order.map((name) => ({ name, sets: grouped[name] }));
      const routine = routines.find((r) => r.id === routineId);
      setShareData(buildShareData({ date, routineName: routine?.name, exerciseGroups }));
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const activeTagSet =
    tagPicker !== null ? exercises[tagPicker.exIdx]?.sets[tagPicker.setIdx] : null;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase" }}>
          New Session
        </span>
        <span className="mono" style={{ fontSize: 10.5, color: "var(--text-muted)" }}>{date}</span>
      </div>

      <div style={{ ...card, display: "flex", gap: 10 }}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>날짜</label>
          <input type="date" className="mono" value={date} onChange={(e) => setDate(e.target.value)} style={inputStyle} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>루틴</label>
          <select value={routineId} onChange={(e) => handleRoutineChange(e.target.value)} style={inputStyle}>
            <option value="">자유 기록</option>
            {routines.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <RestTimer autoStartSignal={timerSignal} />

      <datalist id="exercise-names">
        {exerciseNames.map((n) => (
          <option key={n} value={n} />
        ))}
      </datalist>

      {exercises.map((ex, exIdx) => {
        const pr = prMap[ex.name.trim()];
        const ghostSets = lastSessionMap[ex.name.trim()];
        const nextTarget = ghostSets ? suggestNextTarget(ghostSets) : null;
        return (
          <div key={exIdx} style={card}>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <MoveIconBadge name={ex.name} muscleGroup={ex.muscleGroup} onClick={() => setPickerIndex(exIdx)} />
              <input
                placeholder="운동 종목 (예: 벤치프레스)"
                value={ex.name}
                onChange={(e) => updateExerciseName(exIdx, e.target.value)}
                list="exercise-names"
                style={{ ...inputStyle, flex: 1 }}
              />
              <select
                value={ex.muscleGroup}
                onChange={(e) => updateExerciseMuscleGroup(exIdx, e.target.value)}
                style={{
                  width: 84,
                  flex: "0 0 auto",
                  padding: "8px 6px",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--border-strong)",
                  background: "transparent",
                  color: "var(--text-faint)",
                  fontSize: 11.5,
                }}
              >
                {MUSCLE_GROUPS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
              {exercises.length > 1 && (
                <button onClick={() => removeExercise(exIdx)} style={smallBtn}>
                  종목 삭제
                </button>
              )}
            </div>

            {(pr !== undefined || ghostSets || nextTarget) && (
              <div style={{ marginTop: 10, paddingTop: 8, borderTop: "1px dashed var(--border)" }}>
                {pr !== undefined && (
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, marginBottom: 4 }}>
                    <span style={{ color: "var(--text-faint)" }}>PR</span>
                    <span className="mono" style={{ color: "var(--text-muted)" }}>{pr}kg</span>
                  </div>
                )}
                {ghostSets && (
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, marginBottom: 4 }}>
                    <span style={{ color: "var(--text-faint)" }}>지난 세션</span>
                    <span className="mono" style={{ color: "var(--text-muted)" }}>
                      {ghostSets.filter(Boolean).map((g) => `${g.weight}kg×${g.reps}`).join(", ")}
                    </span>
                  </div>
                )}
                {nextTarget && (
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5 }}>
                    <span style={{ color: "var(--text-faint)" }}>다음 목표</span>
                    <span className="mono" style={{ color: "var(--accent)", fontWeight: 700 }}>
                      {nextTarget.weight}kg×{nextTarget.reps} →
                    </span>
                  </div>
                )}
              </div>
            )}

            <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
              {ex.sets.map((s, setIdx) => {
                const ghost = ghostSets?.[setIdx];
                const isNewPR = pr !== undefined && s.weight !== "" && Number(s.weight) > pr;
                return (
                  <div
                    key={setIdx}
                    style={{
                      background: "var(--bg-elevated-2)",
                      border: "1px solid var(--border)",
                      borderRadius: "var(--radius-sm)",
                      padding: 10,
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 600 }}>
                        {setIdx + 1}세트
                        {s.tag && (
                          <span style={{ marginLeft: 6, color: "var(--accent)" }}>
                            {s.tag === "failure" ? "실패" : s.tag === "dropset" ? "드롭세트" : "보조"}
                          </span>
                        )}
                      </span>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          type="button"
                          onClick={() => setTagPicker({ exIdx, setIdx })}
                          style={smallIconBtn}
                        >
                          {s.rpe ? `RPE ${s.rpe}` : "RPE"}
                        </button>
                        {ex.sets.length > 1 && (
                          <button type="button" onClick={() => removeSet(exIdx, setIdx)} style={smallIconBtn}>
                            삭제
                          </button>
                        )}
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8 }}>
                      <button
                        type="button"
                        onClick={() => stepSet(exIdx, setIdx, "weight", -2.5)}
                        style={stepperBtnStyle}
                      >
                        −
                      </button>
                      <input
                        type="number"
                        step="0.5"
                        className="mono"
                        placeholder={ghost ? String(ghost.weight) : "무게"}
                        value={s.weight}
                        onChange={(e) => updateSet(exIdx, setIdx, "weight", e.target.value)}
                        style={{
                          ...inputStyle,
                          flex: 1,
                          textAlign: "center",
                          fontWeight: 700,
                          borderColor: isNewPR ? "var(--accent)" : undefined,
                          boxShadow: isNewPR ? "0 0 0 1px var(--accent)" : undefined,
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => stepSet(exIdx, setIdx, "weight", 2.5)}
                        style={stepperBtnStyle}
                      >
                        +
                      </button>
                      <span style={{ fontSize: 12, color: "var(--text-muted)", width: 20 }}>kg</span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
                      <button
                        type="button"
                        onClick={() => stepSet(exIdx, setIdx, "reps", -1)}
                        style={stepperBtnStyle}
                      >
                        −
                      </button>
                      <input
                        type="number"
                        className="mono"
                        placeholder={ghost ? String(ghost.reps) : "횟수"}
                        value={s.reps}
                        onChange={(e) => updateSet(exIdx, setIdx, "reps", e.target.value)}
                        style={{ ...inputStyle, flex: 1, textAlign: "center", fontWeight: 700 }}
                      />
                      <button
                        type="button"
                        onClick={() => stepSet(exIdx, setIdx, "reps", 1)}
                        style={stepperBtnStyle}
                      >
                        +
                      </button>
                      <span style={{ fontSize: 12, color: "var(--text-muted)", width: 20 }}>회</span>
                    </div>

                    {isNewPR && (
                      <p style={{ fontSize: 12, color: "var(--accent)", fontWeight: 700, margin: "6px 0 0" }}>신기록!</p>
                    )}

                    <button
                      type="button"
                      onClick={() => toggleComplete(exIdx, setIdx)}
                      style={{
                        width: "100%",
                        marginTop: 8,
                        padding: 10,
                        borderRadius: 8,
                        border: "none",
                        cursor: "pointer",
                        fontWeight: 700,
                        fontSize: 14,
                        background: s.completed ? "var(--accent)" : "var(--bg-elevated)",
                        color: s.completed ? "var(--accent-text)" : "var(--text-muted)",
                      }}
                    >
                      {s.completed ? "완료" : "완료로 표시"}
                    </button>
                  </div>
                );
              })}
              <button onClick={() => addSet(exIdx)} style={ghostAddBtn}>
                + 세트 추가
              </button>
            </div>
          </div>
        );
      })}

      <button onClick={addExercise} style={{ ...ghostAddBtn, marginTop: 4 }}>
        + 종목 추가
      </button>

      {error && <p style={{ color: "var(--danger)", fontSize: 13, marginTop: 12 }}>{error}</p>}

      <button
        onClick={handleSave}
        disabled={saving}
        style={{ ...primaryBtn, width: "100%", marginTop: 16, textTransform: "uppercase", letterSpacing: "0.04em" }}
      >
        {saving ? "저장 중..." : "Save Session"}
      </button>

      <ExercisePicker
        open={pickerIndex !== null}
        onClose={() => setPickerIndex(null)}
        onSelect={(ex) => {
          setExercises((prev) =>
            prev.map((e, idx) =>
              idx === pickerIndex ? { ...e, name: ex.name, muscleGroup: ex.muscleGroup } : e
            )
          );
        }}
      />

      <SetTagPicker
        open={tagPicker !== null}
        onClose={() => setTagPicker(null)}
        rpe={activeTagSet?.rpe ?? null}
        tag={activeTagSet?.tag ?? null}
        onChangeRpe={(v) => tagPicker && updateSetRpe(tagPicker.exIdx, tagPicker.setIdx, v)}
        onChangeTag={(v) => tagPicker && updateSetTag(tagPicker.exIdx, tagPicker.setIdx, v)}
      />

      <ShareWorkoutModal
        open={shareData !== null}
        shareData={shareData}
        onClose={() => {
          setShareData(null);
          router.push("/history");
        }}
      />
    </div>
  );
}

const labelStyle = { display: "block", fontSize: 13, color: "var(--text-muted)", marginBottom: 6 };

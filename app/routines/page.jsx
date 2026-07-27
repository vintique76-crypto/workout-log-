"use client";

import { useEffect, useState } from "react";
import { useRequireSession } from "../../lib/useSession";
import { useExerciseStats } from "../../lib/useExerciseStats";
import { supabase } from "../../lib/supabaseClient";
import { inputStyle, primaryBtn, smallBtn, card } from "../../lib/ui";
import { MUSCLE_GROUPS } from "../../lib/muscleGroups";

function emptyEntry() {
  return { name: "", muscleGroup: "기타" };
}

export default function RoutinesPage() {
  const session = useRequireSession();
  const { names: exerciseNames } = useExerciseStats(session);
  const [routines, setRoutines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [exercises, setExercises] = useState([emptyEntry()]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editExercises, setEditExercises] = useState([emptyEntry()]);
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState("");

  const load = async () => {
    const { data } = await supabase
      .from("routines")
      .select("id, name, created_at, routine_exercises(id, name, order_index, muscle_group)")
      .order("created_at", { ascending: false });
    setRoutines(data || []);
    setLoading(false);
  };

  useEffect(() => {
    if (session) load();
  }, [session]);

  if (!session) return <p>로딩 중...</p>;

  const updateExercise = (i, field, value) => {
    const next = [...exercises];
    next[i] = { ...next[i], [field]: value };
    setExercises(next);
  };

  const addExerciseField = () => setExercises([...exercises, emptyEntry()]);
  const removeExerciseField = (i) => setExercises(exercises.filter((_, idx) => idx !== i));

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    const clean = exercises.map((x) => ({ ...x, name: x.name.trim() })).filter((x) => x.name);
    if (!name.trim() || clean.length === 0) {
      setError("루틴 이름과 운동 종목을 최소 1개 입력해주세요.");
      return;
    }
    setSaving(true);
    try {
      const { data: routine, error: rErr } = await supabase
        .from("routines")
        .insert({ user_id: session.user.id, name: name.trim() })
        .select()
        .single();
      if (rErr) throw rErr;

      const rows = clean.map((x, idx) => ({
        routine_id: routine.id,
        name: x.name,
        muscle_group: x.muscleGroup,
        order_index: idx,
      }));
      const { error: eErr } = await supabase.from("routine_exercises").insert(rows);
      if (eErr) throw eErr;

      setName("");
      setExercises([emptyEntry()]);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("이 루틴을 삭제할까요?")) return;
    await supabase.from("routines").delete().eq("id", id);
    load();
  };

  const startEdit = (r) => {
    setEditingId(r.id);
    setEditName(r.name);
    const sorted = [...r.routine_exercises].sort((a, b) => a.order_index - b.order_index);
    setEditExercises(
      sorted.length ? sorted.map((ex) => ({ name: ex.name, muscleGroup: ex.muscle_group || "기타" })) : [emptyEntry()]
    );
    setEditError("");
  };

  const cancelEdit = () => setEditingId(null);

  const updateEditExercise = (i, field, value) => {
    const next = [...editExercises];
    next[i] = { ...next[i], [field]: value };
    setEditExercises(next);
  };
  const addEditExerciseField = () => setEditExercises([...editExercises, emptyEntry()]);
  const removeEditExerciseField = (i) => setEditExercises(editExercises.filter((_, idx) => idx !== i));

  const saveEdit = async (id) => {
    setEditError("");
    const clean = editExercises.map((x) => ({ ...x, name: x.name.trim() })).filter((x) => x.name);
    if (!editName.trim() || clean.length === 0) {
      setEditError("루틴 이름과 운동 종목을 최소 1개 입력해주세요.");
      return;
    }
    setEditSaving(true);
    try {
      const { error: rErr } = await supabase.from("routines").update({ name: editName.trim() }).eq("id", id);
      if (rErr) throw rErr;

      const { error: delErr } = await supabase.from("routine_exercises").delete().eq("routine_id", id);
      if (delErr) throw delErr;

      const rows = clean.map((x, idx) => ({
        routine_id: id,
        name: x.name,
        muscle_group: x.muscleGroup,
        order_index: idx,
      }));
      const { error: insErr } = await supabase.from("routine_exercises").insert(rows);
      if (insErr) throw insErr;

      setEditingId(null);
      await load();
    } catch (err) {
      setEditError(err.message);
    } finally {
      setEditSaving(false);
    }
  };

  return (
    <div>
      <h1 style={{ fontSize: 20 }}>루틴 관리</h1>

      <datalist id="exercise-names">
        {exerciseNames.map((n) => (
          <option key={n} value={n} />
        ))}
      </datalist>

      <form onSubmit={handleCreate} style={{ ...card, display: "flex", flexDirection: "column", gap: 8 }}>
        <input
          placeholder="루틴 이름 (예: 가슴/삼두 day)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={inputStyle}
        />
        {exercises.map((ex, i) => (
          <div key={i} style={{ display: "flex", gap: 6 }}>
            <input
              placeholder={`운동 종목 ${i + 1} (예: 벤치프레스)`}
              value={ex.name}
              onChange={(e) => updateExercise(i, "name", e.target.value)}
              list="exercise-names"
              style={{ ...inputStyle, flex: 1 }}
            />
            <select
              value={ex.muscleGroup}
              onChange={(e) => updateExercise(i, "muscleGroup", e.target.value)}
              style={{ ...inputStyle, width: 90, flex: "0 0 auto" }}
            >
              {MUSCLE_GROUPS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
            {exercises.length > 1 && (
              <button type="button" onClick={() => removeExerciseField(i)} style={smallBtn}>
                삭제
              </button>
            )}
          </div>
        ))}
        <button type="button" onClick={addExerciseField} style={{ ...smallBtn, alignSelf: "flex-start" }}>
          + 종목 추가
        </button>
        {error && <p style={{ color: "#c00", fontSize: 13 }}>{error}</p>}
        <button type="submit" disabled={saving} style={primaryBtn}>
          {saving ? "저장 중..." : "루틴 저장"}
        </button>
      </form>

      <h2 style={{ fontSize: 16, marginTop: 24 }}>내 루틴</h2>
      {loading ? (
        <p>불러오는 중...</p>
      ) : routines.length === 0 ? (
        <p style={{ color: "#888" }}>아직 만든 루틴이 없어요.</p>
      ) : (
        routines.map((r) =>
          editingId === r.id ? (
            <div key={r.id} style={{ ...card, display: "flex", flexDirection: "column", gap: 8 }}>
              <input value={editName} onChange={(e) => setEditName(e.target.value)} style={inputStyle} />
              {editExercises.map((ex, i) => (
                <div key={i} style={{ display: "flex", gap: 6 }}>
                  <input
                    value={ex.name}
                    onChange={(e) => updateEditExercise(i, "name", e.target.value)}
                    list="exercise-names"
                    style={{ ...inputStyle, flex: 1 }}
                  />
                  <select
                    value={ex.muscleGroup}
                    onChange={(e) => updateEditExercise(i, "muscleGroup", e.target.value)}
                    style={{ ...inputStyle, width: 90, flex: "0 0 auto" }}
                  >
                    {MUSCLE_GROUPS.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                  {editExercises.length > 1 && (
                    <button type="button" onClick={() => removeEditExerciseField(i)} style={smallBtn}>
                      삭제
                    </button>
                  )}
                </div>
              ))}
              <button type="button" onClick={addEditExerciseField} style={{ ...smallBtn, alignSelf: "flex-start" }}>
                + 종목 추가
              </button>
              {editError && <p style={{ color: "#c00", fontSize: 13 }}>{editError}</p>}
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => saveEdit(r.id)} disabled={editSaving} style={{ ...primaryBtn, flex: 1 }}>
                  {editSaving ? "저장 중..." : "저장"}
                </button>
                <button onClick={cancelEdit} style={{ ...smallBtn, flex: 1 }}>
                  취소
                </button>
              </div>
            </div>
          ) : (
            <div key={r.id} style={card}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <strong>{r.name}</strong>
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => startEdit(r)} style={smallBtn}>
                    수정
                  </button>
                  <button onClick={() => handleDelete(r.id)} style={{ ...smallBtn, color: "#c00" }}>
                    삭제
                  </button>
                </div>
              </div>
              <ul style={{ margin: "8px 0 0", paddingLeft: 18, color: "#555", fontSize: 14 }}>
                {[...r.routine_exercises]
                  .sort((a, b) => a.order_index - b.order_index)
                  .map((ex) => (
                    <li key={ex.id}>
                      {ex.name}
                      {ex.muscle_group && <span style={{ color: "#aaa" }}> · {ex.muscle_group}</span>}
                    </li>
                  ))}
              </ul>
            </div>
          )
        )
      )}
    </div>
  );
}

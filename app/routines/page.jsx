"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRequireSession } from "../../lib/useSession";
import { useExerciseStats } from "../../lib/useExerciseStats";
import { supabase } from "../../lib/supabaseClient";
import { inputStyle, primaryBtn, smallBtn, card, sectionLabel } from "../../lib/ui";
import { MUSCLE_GROUPS } from "../../lib/muscleGroups";
import MoveIconBadge from "../../components/MoveIconBadge";
import ExercisePicker from "../../components/ExercisePicker";
import RoutineTemplatePicker from "../../components/RoutineTemplatePicker";
import EmptyState from "../../components/EmptyState";
import { colorForMuscleGroup } from "../../lib/muscleGroupColors";

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
  const [picker, setPicker] = useState(null);
  const [templatePickerOpen, setTemplatePickerOpen] = useState(false);
  const [importingId, setImportingId] = useState(null);
  const [importMessage, setImportMessage] = useState("");

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
    setExercises((prev) => prev.map((ex, idx) => (idx === i ? { ...ex, [field]: value } : ex)));
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

  const handleImportTemplate = async (template) => {
    setImportingId(template.id);
    setImportMessage("");
    try {
      for (const r of template.routines) {
        const { data: routine, error: rErr } = await supabase
          .from("routines")
          .insert({ user_id: session.user.id, name: r.name })
          .select()
          .single();
        if (rErr) throw rErr;

        const rows = r.exercises.map((ex, idx) => ({
          routine_id: routine.id,
          name: ex.name,
          muscle_group: ex.muscleGroup,
          order_index: idx,
        }));
        const { error: eErr } = await supabase.from("routine_exercises").insert(rows);
        if (eErr) throw eErr;
      }
      setImportMessage(`"${template.name}" 루틴을 추가했어요.`);
      setTemplatePickerOpen(false);
      await load();
    } catch (err) {
      setImportMessage(err.message);
    } finally {
      setImportingId(null);
    }
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
    setEditExercises((prev) => prev.map((ex, idx) => (idx === i ? { ...ex, [field]: value } : ex)));
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

      <button
        type="button"
        onClick={() => {
          setImportMessage("");
          setTemplatePickerOpen(true);
        }}
        style={{ ...smallBtn, marginTop: 10, background: "var(--bg-elevated)" }}
      >
        템플릿에서 가져오기
      </button>
      {importMessage && (
        <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 6 }}>{importMessage}</p>
      )}

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
          <div key={i} style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <MoveIconBadge
              name={ex.name}
              muscleGroup={ex.muscleGroup}
              size={32}
              onClick={() => setPicker({ mode: "create", index: i })}
            />
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
        {error && <p style={{ color: "var(--danger)", fontSize: 13 }}>{error}</p>}
        <button type="submit" disabled={saving} style={primaryBtn}>
          {saving ? "저장 중..." : "루틴 저장"}
        </button>
      </form>

      <h2 style={{ ...sectionLabel, marginTop: 24 }}>내 루틴</h2>
      {loading ? (
        <p>불러오는 중...</p>
      ) : routines.length === 0 ? (
        <EmptyState message="아직 만든 루틴이 없어요." />
      ) : (
        routines.map((r, idx) =>
          editingId === r.id ? (
            <div key={r.id} style={{ ...card, display: "flex", flexDirection: "column", gap: 8 }}>
              <input value={editName} onChange={(e) => setEditName(e.target.value)} style={inputStyle} />
              {editExercises.map((ex, i) => (
                <div key={i} style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <MoveIconBadge
                    name={ex.name}
                    muscleGroup={ex.muscleGroup}
                    size={32}
                    onClick={() => setPicker({ mode: "edit", index: i })}
                  />
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
              {editError && <p style={{ color: "var(--danger)", fontSize: 13 }}>{editError}</p>}
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
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: Math.min(idx, 6) * 0.04 }}
              style={card}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <strong>{r.name}</strong>
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => startEdit(r)} style={smallBtn}>
                    수정
                  </button>
                  <button onClick={() => handleDelete(r.id)} style={{ ...smallBtn, color: "var(--danger)" }}>
                    삭제
                  </button>
                </div>
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
                {Array.from(new Set(r.routine_exercises.map((ex) => ex.muscle_group).filter(Boolean))).map((g) => (
                  <span
                    key={g}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      padding: "2px 8px",
                      borderRadius: 999,
                      background: "var(--bg-elevated-2)",
                      fontSize: 11,
                      color: "var(--text-muted)",
                    }}
                  >
                    <span
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: "50%",
                        background: colorForMuscleGroup(g),
                        flexShrink: 0,
                      }}
                    />
                    {g}
                  </span>
                ))}
              </div>
              <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
                {[...r.routine_exercises]
                  .sort((a, b) => a.order_index - b.order_index)
                  .map((ex) => (
                    <div key={ex.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <MoveIconBadge name={ex.name} muscleGroup={ex.muscle_group} size={30} />
                      <span style={{ fontSize: 14 }}>
                        {ex.name}
                        {ex.muscle_group && (
                          <span style={{ color: "var(--text-faint)" }}> · {ex.muscle_group}</span>
                        )}
                      </span>
                    </div>
                  ))}
              </div>
            </motion.div>
          )
        )
      )}

      <ExercisePicker
        open={picker !== null}
        onClose={() => setPicker(null)}
        onSelect={(ex) => {
          if (picker?.mode === "create") {
            updateExercise(picker.index, "name", ex.name);
            updateExercise(picker.index, "muscleGroup", ex.muscleGroup);
          } else if (picker?.mode === "edit") {
            updateEditExercise(picker.index, "name", ex.name);
            updateEditExercise(picker.index, "muscleGroup", ex.muscleGroup);
          }
        }}
      />

      <RoutineTemplatePicker
        open={templatePickerOpen}
        onClose={() => setTemplatePickerOpen(false)}
        onImport={handleImportTemplate}
        importingId={importingId}
      />
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRequireSession } from "../../lib/useSession";
import { supabase } from "../../lib/supabaseClient";
import { inputStyle, primaryBtn, smallBtn, card } from "../../lib/ui";

export default function RoutinesPage() {
  const session = useRequireSession();
  const [routines, setRoutines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [exercises, setExercises] = useState([""]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    const { data } = await supabase
      .from("routines")
      .select("id, name, created_at, routine_exercises(id, name, order_index)")
      .order("created_at", { ascending: false });
    setRoutines(data || []);
    setLoading(false);
  };

  useEffect(() => {
    if (session) load();
  }, [session]);

  if (!session) return <p>로딩 중...</p>;

  const updateExercise = (i, value) => {
    const next = [...exercises];
    next[i] = value;
    setExercises(next);
  };

  const addExerciseField = () => setExercises([...exercises, ""]);
  const removeExerciseField = (i) => setExercises(exercises.filter((_, idx) => idx !== i));

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    const cleanExercises = exercises.map((x) => x.trim()).filter(Boolean);
    if (!name.trim() || cleanExercises.length === 0) {
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

      const rows = cleanExercises.map((exName, idx) => ({
        routine_id: routine.id,
        name: exName,
        order_index: idx,
      }));
      const { error: eErr } = await supabase.from("routine_exercises").insert(rows);
      if (eErr) throw eErr;

      setName("");
      setExercises([""]);
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

  return (
    <div>
      <h1 style={{ fontSize: 20 }}>루틴 관리</h1>

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
              value={ex}
              onChange={(e) => updateExercise(i, e.target.value)}
              style={{ ...inputStyle, flex: 1 }}
            />
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
        routines.map((r) => (
          <div key={r.id} style={card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <strong>{r.name}</strong>
              <button onClick={() => handleDelete(r.id)} style={{ ...smallBtn, color: "#c00" }}>
                삭제
              </button>
            </div>
            <ul style={{ margin: "8px 0 0", paddingLeft: 18, color: "#555", fontSize: 14 }}>
              {[...r.routine_exercises]
                .sort((a, b) => a.order_index - b.order_index)
                .map((ex) => (
                  <li key={ex.id}>{ex.name}</li>
                ))}
            </ul>
          </div>
        ))
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRequireSession } from "../../lib/useSession";
import { supabase } from "../../lib/supabaseClient";
import { card, smallBtn } from "../../lib/ui";

export default function HistoryPage() {
  const session = useRequireSession();
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState(null);
  const [setsByWorkout, setSetsByWorkout] = useState({});

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("workouts")
      .select("id, date, routines(name)")
      .order("date", { ascending: false })
      .order("created_at", { ascending: false });
    setWorkouts(data || []);
    setLoading(false);
  };

  useEffect(() => {
    if (session) load();
  }, [session]);

  if (!session) return <p>로딩 중...</p>;

  const toggleOpen = async (id) => {
    if (openId === id) {
      setOpenId(null);
      return;
    }
    setOpenId(id);
    if (!setsByWorkout[id]) {
      const { data } = await supabase
        .from("workout_sets")
        .select("id, exercise_name, set_index, reps, weight")
        .eq("workout_id", id)
        .order("exercise_name")
        .order("set_index");
      setSetsByWorkout((prev) => ({ ...prev, [id]: data || [] }));
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("이 운동 기록을 삭제할까요?")) return;
    await supabase.from("workouts").delete().eq("id", id);
    load();
  };

  const grouped = (sets) => {
    const map = {};
    sets.forEach((s) => {
      if (!map[s.exercise_name]) map[s.exercise_name] = [];
      map[s.exercise_name].push(s);
    });
    return map;
  };

  return (
    <div>
      <h1 style={{ fontSize: 20 }}>기록 히스토리</h1>
      {loading ? (
        <p>불러오는 중...</p>
      ) : workouts.length === 0 ? (
        <p style={{ color: "#888" }}>아직 기록이 없어요.</p>
      ) : (
        workouts.map((w) => (
          <div key={w.id} style={card}>
            <div
              style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}
              onClick={() => toggleOpen(w.id)}
            >
              <div>
                <strong>{w.date}</strong>
                <span style={{ color: "#888", marginLeft: 8, fontSize: 13 }}>{w.routines?.name || "자유 기록"}</span>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <Link
                  href={`/workout/${w.id}/edit`}
                  onClick={(e) => e.stopPropagation()}
                  style={{ ...smallBtn, textDecoration: "none", display: "inline-block" }}
                >
                  수정
                </Link>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(w.id);
                  }}
                  style={{ ...smallBtn, color: "#c00" }}
                >
                  삭제
                </button>
              </div>
            </div>
            {openId === w.id && (
              <div style={{ marginTop: 10, fontSize: 14 }}>
                {(setsByWorkout[w.id] || []).length === 0 ? (
                  <p style={{ color: "#888" }}>불러오는 중...</p>
                ) : (
                  Object.entries(grouped(setsByWorkout[w.id])).map(([name, sets]) => (
                    <div key={name} style={{ marginTop: 8 }}>
                      <strong>{name}</strong>
                      <ul style={{ margin: "4px 0 0", paddingLeft: 18, color: "#555" }}>
                        {sets.map((s) => (
                          <li key={s.id}>
                            {s.set_index + 1}세트 · {s.reps}회 · {s.weight}kg
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}

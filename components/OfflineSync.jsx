"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { getQueue, removeFromQueue } from "../lib/offlineQueue";

export default function OfflineSync() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    const flush = async () => {
      const queue = getQueue();
      if (queue.length === 0) return;
      let synced = 0;

      for (const item of queue) {
        try {
          const { data: workout, error: wErr } = await supabase
            .from("workouts")
            .insert({
              user_id: item.userId,
              routine_id: item.routineId || null,
              date: item.date,
              duration_seconds: item.durationSeconds,
            })
            .select()
            .single();
          if (wErr) throw wErr;

          const setsToInsert = item.rows.map((r) => ({ ...r, workout_id: workout.id }));
          const { error: sErr } = await supabase.from("workout_sets").insert(setsToInsert);
          if (sErr) throw sErr;

          removeFromQueue(item.id);
          synced += 1;
        } catch {
          break;
        }
      }

      if (synced > 0) {
        setMessage(`오프라인 중 저장해둔 기록 ${synced}개를 동기화했어요.`);
        setTimeout(() => setMessage(""), 4000);
      }
    };

    flush();
    window.addEventListener("online", flush);
    return () => window.removeEventListener("online", flush);
  }, []);

  if (!message) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 10,
        left: 16,
        right: 16,
        maxWidth: 448,
        margin: "0 auto",
        background: "var(--accent)",
        color: "#fff",
        padding: "10px 14px",
        borderRadius: "var(--radius-sm)",
        fontSize: 13,
        fontWeight: 600,
        zIndex: 60,
        boxShadow: "0 6px 20px var(--accent-glow)",
        textAlign: "center",
      }}
    >
      {message}
    </div>
  );
}

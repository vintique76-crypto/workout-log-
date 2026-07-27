"use client";

import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

export function useLastSessionSets(session) {
  const [map, setMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) return;
    (async () => {
      const { data } = await supabase
        .from("workout_sets")
        .select("exercise_name, set_index, reps, weight, workouts(date)")
        .order("set_index", { ascending: true });

      const latestDateByExercise = {};
      (data || []).forEach((s) => {
        const d = s.workouts?.date;
        if (!d) return;
        if (!latestDateByExercise[s.exercise_name] || d > latestDateByExercise[s.exercise_name]) {
          latestDateByExercise[s.exercise_name] = d;
        }
      });

      const result = {};
      (data || []).forEach((s) => {
        const d = s.workouts?.date;
        if (!d || d !== latestDateByExercise[s.exercise_name]) return;
        if (!result[s.exercise_name]) result[s.exercise_name] = [];
        result[s.exercise_name][s.set_index] = { reps: s.reps, weight: s.weight };
      });

      setMap(result);
      setLoading(false);
    })();
  }, [session]);

  return { lastSessionMap: map, loading };
}

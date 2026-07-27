"use client";

import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

export function useExerciseStats(session) {
  const [names, setNames] = useState([]);
  const [prMap, setPrMap] = useState({});

  useEffect(() => {
    if (!session) return;
    (async () => {
      const [{ data: sets }, { data: routineExercises }] = await Promise.all([
        supabase.from("workout_sets").select("exercise_name, weight"),
        supabase.from("routine_exercises").select("name"),
      ]);

      const nameSet = new Set();
      const pr = {};
      (sets || []).forEach((s) => {
        nameSet.add(s.exercise_name);
        if (pr[s.exercise_name] === undefined || s.weight > pr[s.exercise_name]) {
          pr[s.exercise_name] = s.weight;
        }
      });
      (routineExercises || []).forEach((r) => nameSet.add(r.name));

      setNames(Array.from(nameSet).sort());
      setPrMap(pr);
    })();
  }, [session]);

  return { names, prMap };
}

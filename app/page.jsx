"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useRequireSession } from "../lib/useSession";
import { supabase } from "../lib/supabaseClient";
import { primaryBtn, card, sectionLabel } from "../lib/ui";
import { dateStr, formatDuration } from "../lib/date";
import { computeInsights } from "../lib/insights";
import HomeHero from "../components/HomeHero";
import GoalProgress from "../components/GoalProgress";
import InsightIcon from "../components/InsightIcon";
import WeeklyActivityBars from "../components/WeeklyActivityBars";
import EmptyState from "../components/EmptyState";
import WeeklyReportModal from "../components/WeeklyReportModal";

export default function HomePage() {
  const session = useRequireSession();
  const [recent, setRecent] = useState([]);
  const [dateCounts, setDateCounts] = useState({});
  const [topInsight, setTopInsight] = useState(null);
  const [recommendedRoutine, setRecommendedRoutine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [goal, setGoal] = useState(null);
  const [bodyEntries, setBodyEntries] = useState([]);
  const [recentWorkouts, setRecentWorkouts] = useState([]);
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    if (!session) return;
    (async () => {
      const from = new Date();
      from.setDate(from.getDate() - 90);

      const [{ data: recentData }, { data: setsData }, { data: routinesData }, { data: allWorkouts }, { data: goalData }, { data: bodyData }] =
        await Promise.all([
          supabase
            .from("workouts")
            .select("id, date, routines(name)")
            .order("date", { ascending: false })
            .order("created_at", { ascending: false })
            .limit(5),
          supabase
            .from("workout_sets")
            .select("exercise_name, muscle_group, weight, reps, workouts!inner(date)")
            .gte("workouts.date", dateStr(from)),
          supabase.from("routines").select("id, name"),
          supabase.from("workouts").select("routine_id, date, duration_seconds"),
          supabase.from("goals").select("target_weight, target_skeletal_muscle, target_body_fat").maybeSingle(),
          supabase
            .from("body_weights")
            .select("date, weight, skeletal_muscle_mass, body_fat_percent")
            .order("date", { ascending: true }),
        ]);

      setRecent(recentData || []);
      setGoal(goalData || null);
      setBodyEntries(bodyData || []);
      setRecentWorkouts(allWorkouts || []);

      if ((routinesData || []).length > 0) {
        const lastUsedByRoutine = {};
        (allWorkouts || []).forEach((w) => {
          if (!w.routine_id) return;
          if (!lastUsedByRoutine[w.routine_id] || w.date > lastUsedByRoutine[w.routine_id]) {
            lastUsedByRoutine[w.routine_id] = w.date;
          }
        });
        const sorted = [...routinesData].sort((a, b) => {
          const da = lastUsedByRoutine[a.id] || "";
          const db = lastUsedByRoutine[b.id] || "";
          return da.localeCompare(db);
        });
        setRecommendedRoutine(sorted[0]);
      }

      const counts = {};
      const sets = [];
      (setsData || []).forEach((r) => {
        const d = r.workouts?.date;
        if (!d) return;
        counts[d] = (counts[d] || 0) + 1;
        sets.push({
          exercise_name: r.exercise_name,
          muscle_group: r.muscle_group || "기타",
          weight: r.weight,
          reps: r.reps,
          date: d,
        });
      });
      setDateCounts(counts);
      const insights = computeInsights({ sets, goal: goalData, entries: bodyData || [] });
      setTopInsight(insights[0] || null);
      setLoading(false);
    })();
  }, [session]);

  const weekStats = useMemo(() => {
    let days = 0;
    let sets = 0;
    let prevSets = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const count = dateCounts[dateStr(d)] || 0;
      if (count > 0) days += 1;
      sets += count;
    }
    for (let i = 7; i < 14; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      prevSets += dateCounts[dateStr(d)] || 0;
    }
    const changePct = prevSets > 0 ? Math.round(((sets - prevSets) / prevSets) * 100) : null;

    const from7 = dateStr(new Date(Date.now() - 6 * 86400000));
    const durations = recentWorkouts
      .filter((w) => w.date >= from7 && w.duration_seconds)
      .map((w) => w.duration_seconds);
    const avgDuration = durations.length
      ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
      : null;

    return { days, sets, avgDuration, changePct };
  }, [dateCounts, recentWorkouts]);

  const weekBars = useMemo(() => {
    const bars = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      bars.push({
        date: dateStr(d),
        dayOfWeek: d.getDay(),
        count: dateCounts[dateStr(d)] || 0,
        isToday: i === 0,
      });
    }
    return bars;
  }, [dateCounts]);

  const activeDays90 = useMemo(() => Object.keys(dateCounts).length, [dateCounts]);

  if (!session) return <p>로딩 중...</p>;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase" }}>
          Training Log
        </span>
        <span className="mono" style={{ fontSize: 10.5, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 6 }}>
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "var(--accent)",
              boxShadow: "0 0 8px var(--accent-glow), 0 0 0 3px var(--accent-glow)",
            }}
          />
          {dateStr(new Date()).replaceAll("-", ".")}
        </span>
      </div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <HomeHero days={activeDays90} weekSets={weekStats.sets} />
      </motion.div>

      <div style={{ marginTop: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
          <span className="eyebrow">This Week</span>
        </div>
        <div
          style={{
            ...card,
            marginTop: 0,
            padding: 0,
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            overflow: "hidden",
          }}
        >
          <div style={{ padding: "14px 12px" }}>
            <div className="eyebrow" style={{ marginBottom: 6, fontSize: 10.5 }}>Days</div>
            <div className="mono" style={{ fontSize: 24, fontWeight: 800, color: "var(--text)" }}>
              {weekStats.days}<span style={{ fontSize: 11, color: "var(--text-muted)" }}>/7</span>
            </div>
          </div>
          <div style={{ padding: "14px 12px", borderLeft: "1px solid var(--border)" }}>
            <div className="eyebrow" style={{ marginBottom: 6, fontSize: 10.5 }}>Sets</div>
            <div className="mono" style={{ fontSize: 24, fontWeight: 800, color: "var(--text)" }}>{weekStats.sets}</div>
          </div>
          <div style={{ padding: "14px 12px", borderLeft: "1px solid var(--border)" }}>
            <div className="eyebrow" style={{ marginBottom: 6, fontSize: 10.5 }}>Avg</div>
            <div className="mono" style={{ fontSize: 24, fontWeight: 800, color: "var(--text)" }}>
              {weekStats.avgDuration ? Math.round(weekStats.avgDuration / 60) : "—"}
              {weekStats.avgDuration != null && <span style={{ fontSize: 11, color: "var(--text-muted)" }}>m</span>}
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 10 }}>
        <WeeklyActivityBars
          days={weekBars}
          totalSets={weekStats.sets}
          changePct={weekStats.changePct}
          onShare={() =>
            setReportData({
              days: weekStats.days,
              sets: weekStats.sets,
              avgDurationLabel: formatDuration(weekStats.avgDuration),
              insightMessage: topInsight?.message || null,
              bars: weekBars.map((b) => ({
                label: ["일", "월", "화", "수", "목", "금", "토"][b.dayOfWeek],
                count: b.count,
                isToday: b.isToday,
              })),
            })
          }
        />
      </div>

      {recommendedRoutine ? (
        <div style={{ marginTop: 20 }}>
          <div className="eyebrow" style={{ marginBottom: 8 }}>Today's Routine</div>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.08 }}
            style={{ ...card, marginTop: 0, display: "flex", justifyContent: "space-between", alignItems: "center" }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>{recommendedRoutine.name}</div>
              <div style={{ fontSize: 10.5, color: "var(--text-faint)", marginTop: 2 }}>가장 오래 쉰 루틴</div>
            </div>
            <Link
              href={`/workout/new?routine=${recommendedRoutine.id}`}
              style={{ ...primaryBtn, textDecoration: "none", padding: "10px 18px", textTransform: "uppercase", letterSpacing: "0.04em", fontSize: 12.5 }}
            >
              Start
            </Link>
          </motion.div>
        </div>
      ) : (
        <Link
          href="/workout/new"
          style={{ ...primaryBtn, display: "block", textAlign: "center", textDecoration: "none", marginTop: 16 }}
        >
          오늘 운동 기록하기
        </Link>
      )}

      <div style={{ marginTop: 20 }}>
        <GoalProgress goal={goal} entries={bodyEntries} />
      </div>

      {topInsight && (
        <div style={{ marginTop: 20 }}>
          <div className="eyebrow" style={{ marginBottom: 8 }}>Coaching</div>
          <Link href="/coach" style={{ textDecoration: "none", color: "inherit", display: "block" }}>
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              style={{
                ...card,
                marginTop: 0,
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
              }}
            >
              <InsightIcon type={topInsight.type} tone={topInsight.tone} />
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5 }}>{topInsight.message}</p>
            </motion.div>
          </Link>
        </div>
      )}

      <h2 style={sectionLabel}>최근 기록</h2>
      {loading ? (
        <p>불러오는 중...</p>
      ) : recent.length === 0 ? (
        <EmptyState message="아직 기록이 없어요. 첫 운동을 기록해보세요." />
      ) : (
        recent.map((w, i) => (
          <motion.div
            key={w.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: i * 0.04 }}
            style={{ ...card, display: "flex", justifyContent: "space-between" }}
          >
            <span className="mono">{w.date}</span>
            <span style={{ color: "var(--text-muted)" }}>{w.routines?.name || "자유 기록"}</span>
          </motion.div>
        ))
      )}

      <WeeklyReportModal open={reportData !== null} onClose={() => setReportData(null)} reportData={reportData} />
    </div>
  );
}

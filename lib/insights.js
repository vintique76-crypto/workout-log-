import { dateStr } from "./date";
import { pickJosa } from "./josa";

function volumeOf(sets) {
  return sets.reduce((sum, s) => sum + s.reps * s.weight, 0);
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d;
}

function insightVolumeTrend(sets) {
  const from7 = dateStr(daysAgo(6));
  const from14 = dateStr(daysAgo(13));
  const thisWeek = sets.filter((s) => s.date >= from7);
  const lastWeek = sets.filter((s) => s.date >= from14 && s.date < from7);

  const thisVol = volumeOf(thisWeek);
  const lastVol = volumeOf(lastWeek);

  if (lastVol === 0) return null;
  const change = ((thisVol - lastVol) / lastVol) * 100;

  if (change >= 10) {
    return {
      tone: "positive",
      type: "volumeUp",
      message: `이번 주 총 볼륨이 지난주보다 ${Math.round(change)}% 늘었어요. 좋은 흐름이에요.`,
    };
  }
  if (change <= -15) {
    return {
      tone: "warning",
      type: "volumeDown",
      message: `이번 주 총 볼륨이 지난주보다 ${Math.round(Math.abs(change))}% 줄었어요. 컨디션은 괜찮으신가요?`,
    };
  }
  return null;
}

function insightPlateau(sets) {
  const byExercise = {};
  sets.forEach((s) => {
    if (!byExercise[s.exercise_name]) byExercise[s.exercise_name] = {};
    if (!byExercise[s.exercise_name][s.date]) byExercise[s.exercise_name][s.date] = [];
    byExercise[s.exercise_name][s.date].push(s.weight);
  });

  for (const [name, byDate] of Object.entries(byExercise)) {
    const sessions = Object.entries(byDate)
      .map(([date, weights]) => ({ date, max: Math.max(...weights) }))
      .sort((a, b) => a.date.localeCompare(b.date));

    if (sessions.length < 3) continue;
    const last3 = sessions.slice(-3);
    const [first, , last] = last3;
    if (last.max <= first.max) {
      const josa = pickJosa(name, "이", "가");
      return {
        tone: "warning",
        type: "plateau",
        message: `${name}${josa} 최근 ${last3.length}세션째 최고 무게 갱신이 없어요. 디로드나 세트 구성을 바꿔보는 것도 좋아요.`,
      };
    }
  }
  return null;
}

function insightImbalance(sets) {
  const from14 = dateStr(daysAgo(13));
  const recent = sets.filter((s) => s.date >= from14);
  const majorGroups = ["가슴", "등", "하체"];
  const present = new Set(recent.map((s) => s.muscle_group));

  const missing = majorGroups.filter((g) => !present.has(g));
  if (missing.length > 0 && recent.length > 0) {
    return {
      tone: "warning",
      type: "imbalance",
      message: `최근 2주간 ${missing.join(", ")} 운동이 없었어요. 균형 있게 챙겨보는 건 어떨까요?`,
    };
  }
  return null;
}

function insightConsecutive(sets) {
  const byDate = {};
  sets.forEach((s) => {
    if (!byDate[s.date]) byDate[s.date] = new Set();
    byDate[s.date].add(s.muscle_group);
  });

  const groupCounts = {};
  for (let i = 0; i < 4; i++) {
    const d = dateStr(daysAgo(i));
    const groups = byDate[d];
    if (!groups) continue;
    groups.forEach((g) => {
      if (g === "유산소" || g === "코어" || g === "기타") return;
      groupCounts[g] = (groupCounts[g] || 0) + 1;
    });
  }

  for (const [group, count] of Object.entries(groupCounts)) {
    if (count >= 3) {
      return {
        tone: "warning",
        type: "overtraining",
        message: `최근 4일 중 ${count}일 ${group} 운동을 했어요. 회복을 위해 하루 쉬는 것도 고려해보세요.`,
      };
    }
  }
  return null;
}

function insightGoalProjection(goal, entries) {
  if (!goal?.target_weight || !entries || entries.length < 2) return null;

  const from21 = dateStr(daysAgo(20));
  const recent = entries.filter((e) => e.date >= from21 && e.weight != null);
  if (recent.length < 2) return null;

  const first = recent[0];
  const last = recent[recent.length - 1];
  const daySpan = (new Date(last.date) - new Date(first.date)) / 86400000;
  if (daySpan < 5) return null;

  const target = goal.target_weight;
  const remaining = target - last.weight;
  if (Math.abs(remaining) < 0.2) return null;

  const changePerDay = (last.weight - first.weight) / daySpan;
  if (changePerDay === 0 || Math.sign(changePerDay) !== Math.sign(remaining)) return null;

  const daysToGoal = remaining / changePerDay;
  if (daysToGoal <= 0 || daysToGoal > 365) return null;

  const weeks = Math.max(1, Math.round(daysToGoal / 7));
  return {
    tone: "positive",
    type: "goalProjection",
    message: `최근 추세라면 목표 체중까지 약 ${weeks}주 남았어요.`,
  };
}

function insightDeload(sets) {
  const weeks = [];
  for (let w = 0; w < 6; w++) {
    const from = dateStr(daysAgo(w * 7 + 6));
    const to = dateStr(daysAgo(w * 7));
    const vol = volumeOf(sets.filter((s) => s.date >= from && s.date <= to));
    weeks.push(vol);
  }
  const priorWeeks = weeks.slice(1);
  const activeWeeks = priorWeeks.filter((v) => v > 0);
  if (activeWeeks.length < 4) return null;

  const maxVol = Math.max(...priorWeeks);
  if (maxVol === 0) return null;

  const hadDeload = priorWeeks.some((v) => v > 0 && v < maxVol * 0.6);
  const sustainedHigh = priorWeeks.every((v) => v >= maxVol * 0.7);

  if (!hadDeload && sustainedHigh) {
    return {
      tone: "warning",
      type: "deload",
      message: "최근 5주간 훈련 볼륨이 계속 높게 유지되고 있어요. 디로드 주간을 한번 가져가는 것도 좋아요.",
    };
  }
  return null;
}

function insightStreak(sets) {
  const dates = new Set(sets.map((s) => s.date));
  let streak = 0;
  for (let i = 0; i < 30; i++) {
    const d = dateStr(daysAgo(i));
    if (dates.has(d)) {
      streak++;
    } else if (i > 0) {
      break;
    } else {
      break;
    }
  }
  if (streak >= 3) {
    return { tone: "positive", type: "streak", message: `${streak}일 연속 운동 중이에요. 페이스 좋아요!` };
  }
  return null;
}

export function computeInsights({ sets, goal, entries }) {
  const results = [
    insightStreak(sets),
    insightVolumeTrend(sets),
    insightPlateau(sets),
    insightImbalance(sets),
    insightConsecutive(sets),
    insightDeload(sets),
    goal && entries ? insightGoalProjection(goal, entries) : null,
  ];
  return results.filter(Boolean);
}

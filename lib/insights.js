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
    return { tone: "positive", message: `이번 주 총 볼륨이 지난주보다 ${Math.round(change)}% 늘었어요. 좋은 흐름이에요.` };
  }
  if (change <= -15) {
    return {
      tone: "warning",
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
        message: `최근 4일 중 ${count}일 ${group} 운동을 했어요. 회복을 위해 하루 쉬는 것도 고려해보세요.`,
      };
    }
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
    return { tone: "positive", message: `${streak}일 연속 운동 중이에요. 페이스 좋아요!` };
  }
  return null;
}

export function computeInsights({ sets }) {
  const results = [insightStreak(sets), insightVolumeTrend(sets), insightPlateau(sets), insightImbalance(sets), insightConsecutive(sets)];
  return results.filter(Boolean);
}

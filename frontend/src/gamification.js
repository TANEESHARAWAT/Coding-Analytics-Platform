export function computeXP(history, studentId) {
  const subs = history.filter((h) => h.student_id === studentId);
  let xp = 0;
  subs.forEach((s) => {
    if (s.verdict === "AC") xp += 50;
    else if (["WA", "CE", "RE"].includes(s.verdict)) xp += 5;
  });
  return xp;
}

export function computeLevel(xp) {
  const level = Math.floor(xp / 200) + 1;
  const currentLevelXp = xp % 200;
  return { level, currentLevelXp, xpToNext: 200 };
}

export function computeAchievements(history, studentId) {
  const subs = history
    .filter((h) => h.student_id === studentId)
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  const achievements = [];

  achievements.push({ id: "first_commit", name: "First Commit", desc: "Make your first submission", earned: subs.length > 0 });

  const hasAC = subs.some((s) => s.verdict === "AC");
  achievements.push({ id: "first_blood", name: "First Blood", desc: "Get your first Accepted verdict", earned: hasAC });

  const languages = new Set(subs.filter((s) => s.verdict === "AC").map((s) => s.language));
  achievements.push({ id: "polyglot", name: "Polyglot", desc: "Solve problems in both C++ and Python", earned: languages.size >= 2 });

  achievements.push({ id: "marathoner", name: "Marathoner", desc: "Make 20+ submissions", earned: subs.length >= 20 });

  let maxStreak = 0, streak = 0;
  subs.forEach((s) => {
    if (s.verdict === "AC") { streak++; maxStreak = Math.max(maxStreak, streak); }
    else if (s.verdict !== "No Test Cases") { streak = 0; }
  });
  achievements.push({ id: "perfectionist", name: "Perfectionist", desc: "Get 5 Accepted verdicts in a row", earned: maxStreak >= 5 });

  return achievements;
}
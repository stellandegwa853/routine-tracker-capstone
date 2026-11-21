// Burnout Risk Index (BRI): higher stress and less sleep raise the score (10-100).
export function computeBri(logs) {
  const average = (field) =>
    logs.reduce((sum, log) => sum + Number(log[field]), 0) / logs.length;

  const avgSleep = logs.length ? average('sleep_hours') : 7.0;
  const avgStress = logs.length ? average('stress_level') : 3.0;
  const avgHydration = logs.length ? Math.round(average('hydration_ml')) : 2000;
  const avgStudy = logs.length ? average('study_hours') : 4.0;

  const score = Math.min(100, Math.max(10, Math.round(avgStress * 14 + (8 - avgSleep) * 7)));

  return {
    score,
    label: briLabel(score),
    avgSleep: Number(avgSleep.toFixed(1)),
    avgStress: Number(avgStress.toFixed(1)),
    avgHydration,
    avgStudy: Number(avgStudy.toFixed(1))
  };
}

export function briLabel(score) {
  if (score > 70) return 'High Strain';
  if (score > 45) return 'Sustainable Balance';
  return 'Low Risk';
}

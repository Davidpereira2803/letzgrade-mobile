export function requiredForTarget60({
  entries,
  target,
  totalWeightPct = 100,
  minGrade = 0,
  maxGrade = 60,
}) {
  const completed = entries.map(e => ({ score: e.score, weight: e.weightPct / totalWeightPct }));
  const currentWeighted = completed.reduce((s, g) => s + g.score * g.weight, 0);
  const used = completed.reduce((s, g) => s + g.weight, 0);
  const remainingWeight = +(1 - used).toFixed(6);

  if (remainingWeight <= 0) {
    if (currentWeighted >= target) {
      return { ok: true, reason: 'already_met', required: minGrade, currentWeighted, remainingWeight: 0 };
    }
    return { ok: false, reason: 'no_weight_left', required: Infinity, currentWeighted, remainingWeight: 0 };
  }

  const required = (target - currentWeighted) / remainingWeight;

  if (required <= minGrade) {
    return { ok: true, reason: 'already_met', required: minGrade, currentWeighted, remainingWeight };
  }
  if (required > maxGrade) {
    return { ok: false, reason: 'over_cap', required, currentWeighted, remainingWeight };
  }
  return { ok: true, required, currentWeighted, remainingWeight };
}

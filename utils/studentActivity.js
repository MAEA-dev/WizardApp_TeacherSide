export const INACTIVITY_THRESHOLD_DAYS = 7;

export const getCompletionTimestamp = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const date = value?.toDate ? value.toDate() : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.getTime();
};

export const isStudentInactive = (lastActiveAt, now = Date.now()) =>
  Number.isFinite(lastActiveAt) &&
  now - lastActiveAt > INACTIVITY_THRESHOLD_DAYS * 24 * 60 * 60 * 1000;

export const isStudentAtRisk = (averageScore, lastActiveAt, now = Date.now()) =>
  (averageScore !== null && averageScore < 70) || isStudentInactive(lastActiveAt, now);

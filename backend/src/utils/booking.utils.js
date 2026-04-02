export const overlaps = (startA, endA, startB, endB) =>
  startA < endB && endA > startB;

export const isPast = (date) =>
  date.getTime() < Date.now();

export const clampLockMinutes = (minutes, min, max, def) => {
  const parsed = Number(minutes);
  if (!Number.isFinite(parsed)) return def;
  return Math.max(min, Math.min(max, parsed));
};
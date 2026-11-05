export const formatDurationSeconds = (durationSeconds) => {
  if (durationSeconds === null || durationSeconds === undefined || durationSeconds === '') {
    return '—';
  }

  const duration = Number(durationSeconds);
  if (!Number.isFinite(duration) || duration < 0) return '—';

  const totalSeconds = Math.round(duration);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
};

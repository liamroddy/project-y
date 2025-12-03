const SECONDS = 1000;

const unitTable = [
  { label: 'd', ms: 24 * 60 * 60 * SECONDS },
  { label: 'h', ms: 60 * 60 * SECONDS },
  { label: 'm', ms: 60 * SECONDS },
  { label: 's', ms: SECONDS },
];

export function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = Math.max(0, now - timestamp * SECONDS);

  for (const { label, ms } of unitTable) {
    if (diff >= ms) {
      const value = Math.floor(diff / ms);
      return `${value}${label} ago`;
    }
  }

  return 'just now';
}

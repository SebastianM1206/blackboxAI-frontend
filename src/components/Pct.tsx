interface Props { value: number; threshold?: number }

export function Pct({ value, threshold = 0.85 }: Props) {
  const cls = value >= threshold ? 'pill-green' : value >= 0.7 ? 'pill-amber' : 'pill-red';
  return <span className={`pill ${cls}`}>{Math.round(value * 100)}%</span>;
}

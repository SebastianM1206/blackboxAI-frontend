import { useMemo } from 'react';
import type { TestResult } from '../types';
import { makeHeat } from '../utils/heat';

interface Props {
  pattern?: TestResult[];
  total?: number;
  passRate?: number;
  fails?: number;
  height?: number | string;
}

export function HeatMap({ pattern, total, passRate = 0.8, fails, height = 22 }: Props) {
  const cells = useMemo(
    () => pattern ?? makeHeat(total ?? 24, passRate, fails),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return (
    <div className="heat" style={{ height }}>
      {cells.map((r, i) => (
        <div key={i} className={`heat-cell ${r}`} title={`Test #${i + 1} — ${r}`} />
      ))}
    </div>
  );
}

export function HealthDots({ passRate }: { passRate: number }) {
  const pattern = useMemo(
    () => Array.from({ length: 20 }, () => {
      const r = Math.random();
      return r < passRate ? 'ok' : r < passRate + 0.06 ? 'warn' : 'fail';
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  return (
    <span className="health-dots">
      {pattern.map((s, i) => <span key={i} className={s} />)}
    </span>
  );
}

import type { TestResult } from '../types';

export function makeHeat(total: number, passRate: number, fails = 0): TestResult[] {
  const arr: TestResult[] = [];
  let f = fails;
  for (let i = 0; i < total; i++) {
    const r = Math.random();
    if (f > 0 && r < 0.4) { arr.push('fail'); f--; continue; }
    arr.push(r < passRate ? 'pass' : r < passRate + 0.04 ? 'partial' : 'fail');
  }
  return arr;
}

export function initials(name: string): string {
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
}

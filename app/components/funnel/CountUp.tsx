"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";

/** Número que cuenta de 0 al valor (se salta con "reducir movimiento"). */
export function CountUp({ to, ms = 900 }: { to: number; ms?: number }) {
  const reduce = useReducedMotion();
  const [n, setN] = useState(reduce ? to : 0);
  useEffect(() => {
    if (reduce) return;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / ms);
      setN(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, ms, reduce]);
  return <span className="tabular-nums">{reduce ? to : n}</span>;
}

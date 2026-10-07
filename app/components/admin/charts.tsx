"use client";

import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell,
} from "recharts";

/** Gráficos al estilo Tufte (17): máximo dato, mínima tinta. Sin 3D, sin rejas verticales, etiqueta directa. */

const INK = "var(--muted-foreground)";
const BRAND = "var(--primary)";

function shortDay(iso: string): string {
  const [, m, d] = iso.split("-");
  return `${Number(d)}/${Number(m)}`;
}

export function TrendChart({
  data, label, format, color = BRAND,
}: { data: Array<{ day: string; value: number }>; label: string; format: (v: number) => string; color?: string }) {
  const total = data.reduce((a, d) => a + d.value, 0);
  return (
    <figure role="img" aria-label={`${label}. Total del periodo: ${format(total)}.`} className="m-0">
      <div className="h-[210px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={`g-${label}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.28} />
                <stop offset="100%" stopColor={color} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="var(--border)" />
            <XAxis dataKey="day" tickFormatter={shortDay} tick={{ fill: INK, fontSize: 11 }} axisLine={false} tickLine={false} minTickGap={28} />
            <YAxis tickFormatter={(v: number) => format(v)} tick={{ fill: INK, fontSize: 11 }} axisLine={false} tickLine={false} width={64} />
            <Tooltip
              formatter={(v) => [format(Number(v)), label]}
              labelFormatter={(l) => shortDay(String(l))}
              contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", fontSize: 12 }}
            />
            <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2.5} fill={`url(#g-${label})`} isAnimationActive />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </figure>
  );
}

export function HorizontalBars({
  data, format, label,
}: { data: Array<{ name: string; value: number }>; format: (v: number) => string; label: string }) {
  const height = Math.max(120, data.length * 38 + 10);
  return (
    <figure role="img" aria-label={`${label}: ${data.map((d) => `${d.name} ${format(d.value)}`).join(", ")}`} className="m-0">
      <div style={{ height }} className="w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 64, left: 0, bottom: 0 }}>
            <XAxis type="number" hide />
            <YAxis type="category" dataKey="name" tick={{ fill: "var(--foreground)", fontSize: 12, fontWeight: 700 }} axisLine={false} tickLine={false} width={150} />
            <Tooltip formatter={(v) => format(Number(v))} cursor={{ fill: "transparent" }} contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", fontSize: 12 }} />
            <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={18} label={{ position: "right", fill: "var(--foreground)", fontSize: 12, fontWeight: 700, formatter: (v: unknown) => format(Number(v)) }}>
              {data.map((_, i) => <Cell key={i} fill={i === 0 ? BRAND : "color-mix(in oklab, var(--primary) 45%, white)"} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </figure>
  );
}

import { useMemo } from "react";

export interface DateRange {
  /** yyyy-MM-dd inclusive; null = sem limite */
  from: string | null;
  /** yyyy-MM-dd inclusive; null = sem limite */
  to: string | null;
}

export type DatePreset = "hoje" | "ontem" | "7d" | "30d" | "mes" | "tudo" | "custom";

function toISODate(d: Date): string {
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().split("T")[0];
}

export function presetToRange(preset: DatePreset): DateRange {
  const now = new Date();
  const today = toISODate(now);
  switch (preset) {
    case "hoje":
      return { from: today, to: today };
    case "ontem": {
      const y = toISODate(new Date(now.getTime() - 86400000));
      return { from: y, to: y };
    }
    case "7d":
      return { from: toISODate(new Date(now.getTime() - 6 * 86400000)), to: today };
    case "30d":
      return { from: toISODate(new Date(now.getTime() - 29 * 86400000)), to: today };
    case "mes":
      return { from: toISODate(new Date(now.getFullYear(), now.getMonth(), 1)), to: today };
    default:
      return { from: null, to: null };
  }
}

const PRESETS: { key: DatePreset; label: string }[] = [
  { key: "hoje", label: "Hoje" },
  { key: "ontem", label: "Ontem" },
  { key: "7d", label: "7 dias" },
  { key: "30d", label: "30 dias" },
  { key: "mes", label: "Este mês" },
  { key: "tudo", label: "Tudo" },
];

interface AdminDateFilterProps {
  preset: DatePreset;
  range: DateRange;
  onChange: (preset: DatePreset, range: DateRange) => void;
  className?: string;
}

/**
 * Filtro de período compartilhado do admin: presets rápidos (dia a dia)
 * + intervalo customizado De/Até.
 */
export function AdminDateFilter({ preset, range, onChange, className }: AdminDateFilterProps) {
  const inputCls =
    "px-3 py-2 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary";

  const today = useMemo(() => toISODate(new Date()), []);

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className || ""}`}>
      {PRESETS.map((p) => (
        <button
          key={p.key}
          type="button"
          onClick={() => onChange(p.key, presetToRange(p.key))}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
            preset === p.key
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-background text-muted-foreground border-input hover:text-foreground"
          }`}
        >
          {p.label}
        </button>
      ))}
      <div className="flex items-center gap-1.5">
        <input
          type="date"
          aria-label="De"
          max={range.to || today}
          value={range.from || ""}
          onChange={(e) => onChange("custom", { from: e.target.value || null, to: range.to })}
          className={inputCls}
        />
        <span className="text-muted-foreground text-sm">até</span>
        <input
          type="date"
          aria-label="Até"
          min={range.from || undefined}
          value={range.to || ""}
          onChange={(e) => onChange("custom", { from: range.from, to: e.target.value || null })}
          className={inputCls}
        />
      </div>
    </div>
  );
}

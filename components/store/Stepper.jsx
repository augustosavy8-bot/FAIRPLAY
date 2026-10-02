'use client';
import { Minus, Plus } from 'lucide-react';

// min=0 permite bajar a 0 (la bolsa lo usa para quitar el item)
export default function Stepper({ value, onChange, min = 1, max = 99 }) {
  return (
    <div className="s-stepper">
      <button className="s-press" onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} aria-label="Restar">
        <Minus size={16} strokeWidth={2} />
      </button>
      <span aria-live="polite">{value}</span>
      <button className="s-press" onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} aria-label="Sumar">
        <Plus size={16} strokeWidth={2} />
      </button>
    </div>
  );
}

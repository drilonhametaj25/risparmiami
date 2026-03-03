"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";


interface StepProps {
  data: Record<string, any>;
  onNext: (data: Record<string, any>) => void;
  onBack?: () => void;
  isPending?: boolean;
}

export function StepFamily({ data, onNext, onBack }: StepProps) {
  const [childrenCount, setChildrenCount] = useState(data.childrenCount ?? 0);
  const [childrenAges, setChildrenAges] = useState<number[]>(
    data.childrenAges ?? []
  );

  function handleCountChange(delta: number) {
    const newCount = Math.max(0, Math.min(10, childrenCount + delta));
    setChildrenCount(newCount);

    if (newCount > childrenAges.length) {
      setChildrenAges([...childrenAges, ...Array(newCount - childrenAges.length).fill(0)]);
    } else if (newCount < childrenAges.length) {
      setChildrenAges(childrenAges.slice(0, newCount));
    }
  }

  function handleAgeChange(index: number, value: string) {
    const age = parseInt(value) || 0;
    const clamped = Math.max(0, Math.min(30, age));
    const updated = [...childrenAges];
    updated[index] = clamped;
    setChildrenAges(updated);
  }

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-3">
          Numero di figli
        </label>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => handleCountChange(-1)}
            disabled={childrenCount <= 0}
            className="w-10 h-10 flex items-center justify-center border border-border-light rounded-sm text-lg font-medium transition-colors hover:border-accent-primary/30 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            -
          </button>
          <span className="text-2xl font-medium w-8 text-center">{childrenCount}</span>
          <button
            type="button"
            onClick={() => handleCountChange(1)}
            disabled={childrenCount >= 10}
            className="w-10 h-10 flex items-center justify-center border border-border-light rounded-sm text-lg font-medium transition-colors hover:border-accent-primary/30 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            +
          </button>
        </div>
      </div>

      {childrenCount > 0 && (
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-3">
            Eta dei figli
          </label>
          <div className="space-y-3">
            {Array.from({ length: childrenCount }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-sm text-text-muted w-16">Figlio {i + 1}</span>
                <input
                  type="number"
                  value={childrenAges[i] ?? 0}
                  onChange={(e) => handleAgeChange(i, e.target.value)}
                  min="0"
                  max="30"
                  placeholder="Eta"
                  className="w-24 border border-border-light rounded-sm px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary"
                />
                <span className="text-sm text-text-muted">anni</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3">
        {onBack && (
          <Button onClick={onBack} variant="secondary" className="flex-1">
            Indietro
          </Button>
        )}
        <Button
          onClick={() => onNext({
            childrenCount,
            childrenAges: childrenAges.slice(0, childrenCount),
          })}
          className="flex-1"
        >
          Continua
        </Button>
      </div>
    </div>
  );
}

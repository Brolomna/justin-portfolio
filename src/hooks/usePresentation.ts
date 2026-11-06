import { useCallback, useEffect, useState } from 'react';
import type { Scene } from '@/data/scenes';
import { useReducedMotion } from '@/hooks/useReducedMotion';

export interface Presentation {
  index: number;
  scene: Scene;
  count: number;
  reducedMotion: boolean;
  goTo: (i: number) => void;
  next: () => void;
  prev: () => void;
}

export function usePresentation(all: Scene[]): Presentation {
  const reducedMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const scene = all[index];

  // Auto-advance continuously, regardless of pointer or focus position.
  // Reduced motion: scenes never advance on their own; keyboard arrows
  // still step them manually.
  useEffect(() => {
    if (reducedMotion) return;
    const t = window.setTimeout(
      () => setIndex((i) => (i + 1) % all.length),
      scene.duration * 1000
    );
    return () => window.clearTimeout(t);
  }, [reducedMotion, index, scene.duration, all.length]);

  const goTo = useCallback((i: number) => setIndex(i), []);
  const next = useCallback(() => setIndex((i) => (i + 1) % all.length), [all.length]);
  const prev = useCallback(
    () => setIndex((i) => (i - 1 + all.length) % all.length),
    [all.length]
  );

  return {
    index,
    scene,
    count: all.length,
    reducedMotion,
    goTo,
    next,
    prev,
  };
}

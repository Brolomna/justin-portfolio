import { useCallback, useEffect, useState } from 'react';
import type { Scene } from '@/data/scenes';
import { useReducedMotion } from '@/hooks/useReducedMotion';

export interface Presentation {
  index: number;
  scene: Scene;
  count: number;
  playing: boolean;
  autoActive: boolean;
  reducedMotion: boolean;
  goTo: (i: number) => void;
  next: () => void;
  prev: () => void;
  togglePlay: () => void;
  setInteracting: (v: boolean) => void;
}

export function usePresentation(all: Scene[]): Presentation {
  const reducedMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [interacting, setInteracting] = useState(false);

  // Reduced motion: never auto-advance; visitor steps manually.
  useEffect(() => {
    if (reducedMotion) setPlaying(false);
  }, [reducedMotion]);

  const scene = all[index];
  const autoActive = playing && !interacting && !reducedMotion;

  useEffect(() => {
    if (!autoActive) return;
    const t = window.setTimeout(
      () => setIndex((i) => (i + 1) % all.length),
      scene.duration * 1000
    );
    return () => window.clearTimeout(t);
  }, [autoActive, index, scene.duration, all.length]);

  const goTo = useCallback((i: number) => setIndex(i), []);
  const next = useCallback(() => setIndex((i) => (i + 1) % all.length), [all.length]);
  const prev = useCallback(
    () => setIndex((i) => (i - 1 + all.length) % all.length),
    [all.length]
  );
  const togglePlay = useCallback(() => setPlaying((p) => !p), []);

  return {
    index,
    scene,
    count: all.length,
    playing,
    autoActive,
    reducedMotion,
    goTo,
    next,
    prev,
    togglePlay,
    setInteracting,
  };
}

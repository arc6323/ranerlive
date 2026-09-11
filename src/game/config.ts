export const LANE_WIDTH = 3.35;
export const LANES = [-1, 0, 1] as const;
export const ROAD_WIDTH = LANE_WIDTH * 3 + 1.1;
export const SEGMENT_LEN = 22;
export const SEGMENT_COUNT = 16;
export const TOTAL_TRACK = SEGMENT_LEN * SEGMENT_COUNT;
export const TREES_PER_SEG = 14;
export const ROCKS_PER_SEG = 6;
export const COINS_PER_SEG = 8;
export const BUSHES_PER_SEG = 8;
export const SHOULDER_X = -(ROAD_WIDTH / 2 + 2.6);

export const BASE_SPEED = 24;
export const MAX_SPEED = 54;
export const SPEED_GAIN = 0.012;

export const GRAVITY = 46;
export const JUMP_VY = 13.4;
export const RAMP_VY = 18.2;
export const SLIDE_TIME = 0.62;
export const LANE_TIME = 0.2;
export const COYOTE = 0.1;
export const JUMP_BUFFER = 0.12;

export const BIOME_LEN = 480;
export const WARMUP_DIST = 220;

export const SAVE_KEY = "zverotrassa-v1";

export const CHAR_STATS = {
  fox: { speedMul: 1.07, jumpMul: 1, magnetMul: 1 },
  wolf: { speedMul: 1, jumpMul: 1, magnetMul: 1.55 },
  hare: { speedMul: 0.98, jumpMul: 1.24, magnetMul: 1 },
} as const;

export function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v));
}

export function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export function smoothstep(t: number) {
  const x = clamp(t, 0, 1);
  return x * x * (3 - 2 * x);
}

export function easeOutCubic(t: number) {
  const x = 1 - clamp(t, 0, 1);
  return 1 - x * x * x;
}

export function expDamp(cur: number, tgt: number, lambda: number, dt: number) {
  return tgt + (cur - tgt) * Math.exp(-lambda * dt);
}

export function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

export function pick<T>(arr: readonly T[]): T {
  return arr[(Math.random() * arr.length) | 0]!;
}

export function laneX(lane: number) {
  return lane * LANE_WIDTH;
}

export function mulberry(seed: number) {
  let s = seed | 0 || 1;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) | 0;
    return (s >>> 0) / 4294967296;
  };
}

export type CharacterId = "fox" | "wolf" | "hare";
export type Phase = "menu" | "intro" | "playing" | "paused" | "dead";
export type WeatherId = "sun" | "rain" | "snow" | "hail";

export type HudState = {
  phase: Phase;
  score: number;
  coins: number;
  best: number;
  speedKmh: number;
  weather: WeatherId;
  biome: string;
  character: CharacterId;
  multiplier: number;
  shield: boolean;
  magnet: boolean;
  muted: boolean;
  tutorial: boolean;
};

export const CHARACTERS: Record<
  CharacterId,
  { name: string; species: string; trait: string; blurb: string }
> = {
  fox: {
    name: "Рыжая",
    species: "Лиса",
    trait: "Темп",
    blurb: "Быстрее набирает ход по трассе.",
  },
  wolf: {
    name: "Серый",
    species: "Волк",
    trait: "Магнит",
    blurb: "Тянет монеты с соседних полос.",
  },
  hare: {
    name: "Ушастый",
    species: "Заяц",
    trait: "Прыжок",
    blurb: "Выше трамплин и длиннее зависание.",
  },
};

export const WEATHER_LABEL: Record<WeatherId, string> = {
  sun: "Ясно",
  rain: "Ливень",
  snow: "Метель",
  hail: "Град",
};

export const BIOME_LABEL: Record<WeatherId, string> = {
  sun: "Тайга",
  rain: "Трасса",
  snow: "Тундра",
  hail: "Каньон",
};

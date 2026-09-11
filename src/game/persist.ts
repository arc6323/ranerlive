import type { CharacterId } from "./types";
import { SAVE_KEY } from "./config";

export type SaveData = {
  version: number;
  best: number;
  character: CharacterId;
  muted: boolean;
  seenTutorial: boolean;
};

const VERSION = 1;

function defaults(): SaveData {
  return {
    version: VERSION,
    best: 0,
    character: "fox",
    muted: false,
    seenTutorial: false,
  };
}

export function loadSave(): SaveData {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return defaults();
    const parsed = JSON.parse(raw) as Partial<SaveData>;
    return { ...defaults(), ...parsed, version: VERSION };
  } catch {
    return defaults();
  }
}

export function writeSave(data: SaveData) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({ ...data, version: VERSION }));
  } catch {
    /* private mode / quota */
  }
}

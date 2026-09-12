export type GameState = {
  level: number;
  xp: number;
  discoveries: number;
  missionsCompleted: number;
  currentChapter: number;
  currentDiscovery: string | null;
  currentMission: string | null;
  inventory: string[];
};

export const INITIAL_GAME_STATE: GameState = {
  level: 1,
  xp: 120,
  discoveries: 1,
  missionsCompleted: 0,
  currentChapter: 1,
  currentDiscovery: "watcher",
  currentMission: "first-contact",
  inventory: [],
};

export function addXP(state: GameState, amount: number): GameState {
  const nextXP = state.xp + amount;

  return {
    ...state,
    xp: nextXP,
    level: Math.floor(nextXP / 1000) + 1,
  };
}

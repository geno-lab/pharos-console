import { create } from "zustand";
import type { Event as PharosEvent, SkillInfo } from "../bindings";

type Phase = "idle" | "running" | "completed" | "failed";

export type OutOfBand =
  | { type: "task_status"; status: "running" | "idle" }
  | {
      type: "task_result";
      status: "completed" | "failed";
      output?: string;
      error?: string;
    };

export type StreamMessage = PharosEvent | OutOfBand;

interface RunState {
  events: PharosEvent[];
  skills: SkillInfo[];
  phase: Phase;
  result?: string;
  error?: string;
  connected: boolean;

  setSkills: (skills: SkillInfo[]) => void;
  setConnected: (connected: boolean) => void;
  applyMessage: (msg: StreamMessage) => void;
  resetRun: () => void;
}

export const useRun = create<RunState>((set) => ({
  events: [],
  skills: [],
  phase: "idle",
  connected: false,

  setSkills: (skills) => set({ skills }),
  setConnected: (connected) => set({ connected }),

  applyMessage: (msg) =>
    set((state) => {
      switch (msg.type) {
        case "task_status":
          return { phase: msg.status === "running" ? "running" : "idle" };
        case "task_result":
          return {
            phase: msg.status,
            result: msg.output,
            error: msg.error,
          };
        default:
          return { events: [...state.events, msg as PharosEvent] };
      }
    }),

  resetRun: () =>
    set({ events: [], phase: "idle", result: undefined, error: undefined }),
}));

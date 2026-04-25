import { create } from "zustand";
import type { Event as PharosEvent, SkillInfo } from "../bindings";

type Phase = "idle" | "queued" | "running" | "completed" | "failed";

export type OutOfBand =
  | { type: "task_queued"; run_id: string; position: number }
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
  position?: number;
  runId?: string;
  result?: string;
  error?: string;
  connected: boolean;
  lastEventAt?: number;

  setSkills: (skills: SkillInfo[]) => void;
  setConnected: (connected: boolean) => void;
  setQueued: (runId: string, position: number) => void;
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
  setQueued: (runId, position) =>
    set({
      runId,
      position,
      phase: position === 1 ? "running" : "queued",
      events: [],
      result: undefined,
      error: undefined,
      lastEventAt: Date.now(),
    }),

  applyMessage: (msg) =>
    set((state) => {
      const now = Date.now();
      switch (msg.type) {
        case "task_queued":
          // Only adopt the queued event if it's for OUR run (the one we just
          // submitted). Other users' enqueues broadcast via the same WS but
          // shouldn't perturb our local view.
          if (state.runId && msg.run_id !== state.runId) {
            return {};
          }
          return {
            phase: msg.position === 1 ? "running" : "queued",
            position: msg.position,
            runId: msg.run_id,
            lastEventAt: now,
          };
        case "task_status":
          return {
            phase: msg.status === "running" ? "running" : "idle",
            position: undefined,
            lastEventAt: now,
          };
        case "task_result":
          return {
            phase: msg.status,
            result: msg.output,
            error: msg.error,
            position: undefined,
            lastEventAt: now,
          };
        default:
          return {
            events: [...state.events, msg as PharosEvent],
            lastEventAt: now,
          };
      }
    }),

  resetRun: () =>
    set({
      events: [],
      phase: "idle",
      position: undefined,
      runId: undefined,
      result: undefined,
      error: undefined,
      lastEventAt: undefined,
    }),
}));

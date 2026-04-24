import { useEffect } from "react";
import { Shell } from "./components/shell";
import { EmptyScreen } from "./screens/empty";
import { LiveScreen } from "./screens/live";
import { useEventStream } from "./lib/ws";
import { api } from "./lib/api";
import { useRun } from "./lib/store";

export function App() {
  useEventStream();

  const phase = useRun((s) => s.phase);
  const events = useRun((s) => s.events);
  const setSkills = useRun((s) => s.setSkills);

  useEffect(() => {
    let cancelled = false;
    api
      .skills()
      .then((skills) => {
        if (!cancelled) setSkills(skills);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [setSkills]);

  const runActive = phase === "running" || events.length > 0 || phase === "completed" || phase === "failed";

  return (
    <Shell>
      {runActive ? <LiveScreen /> : <EmptyScreen />}
    </Shell>
  );
}

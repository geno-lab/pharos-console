// Mock data — shaped to match bindings/ types (Event, NodeSpec, Verdict, etc.)
// Used to drive realistic streaming in the prototype.

const MOCK_TOPIC = "Investigate whether sparse attention can be replaced with a learned content-routing prior on long-context retrieval tasks, and quantify tradeoffs vs. standard full attention.";

const MOCK_CLARIFICATIONS = [
  {
    id: "q1",
    from: "commander",
    text: "Narrow the retrieval regime. Three reasonable brackets:",
    options: [
      { id: "q1a", label: "(a) sub-8k context — desktop / chat regime" },
      { id: "q1b", label: "(b) 32–128k — document-QA and code-repo regime", chosen: true },
      { id: "q1c", label: "(c) ≥ 1M — novel-length, full-corpus regime" },
    ],
    note: "I'll default to (b) unless you say otherwise; (c) changes the eval harness.",
  },
  {
    id: "q2",
    from: "commander",
    text: "Baseline against:",
    options: [
      { id: "q2a", label: "standard softmax attention only" },
      { id: "q2b", label: "softmax + top-k sparse + MoE-routed", chosen: true },
      { id: "q2c", label: "everything in the long-context arena (linear attn, SSMs, retrieval)" },
    ],
    note: "(b) is the honest comparison — (a) is too easy, (c) blows the runtime budget.",
  },
  {
    id: "q3",
    from: "commander",
    text: "Output expectation:",
    options: [
      { id: "q3a", label: "internal memo (skip LaTeX)" },
      { id: "q3b", label: "workshop-style paper, 6 pages, figures required", chosen: true },
      { id: "q3c", label: "full conference submission w/ appendix" },
    ],
  },
];

// Divergence demo — alternative answer on q1 creates a branch.
const MOCK_BRANCH = {
  id: "branch-long",
  parent: "main",
  divergedAt: "q1",
  divergedChose: "q1c",
  label: "long-context bracket",
  commits: 4,
};

// Initial task graph — typed like NodeSpec[].
// status: pending | active | blocked | done | yellow | red
const MOCK_GRAPH_INITIAL = {
  nodes: [
    { id: "n0", title: "Literature sweep", role: "worker", status: "done", depth: 0, est: "2m" },
    { id: "n1", title: "Formalize routing prior", role: "worker", status: "done", depth: 0, est: "3m" },
    { id: "n2", title: "Synthesize eval harness (32k ctx)", role: "worker", status: "active", depth: 0, est: "6m" },
    { id: "n3", title: "Baseline: softmax + top-k sparse", role: "worker", status: "pending", depth: 0, est: "8m" },
    { id: "n4", title: "Proposed: learned content-routing prior", role: "worker", status: "pending", depth: 0, est: "10m" },
    { id: "n5", title: "Ablations (k, prior temp, init)", role: "worker", status: "pending", depth: 1, est: "6m" },
    { id: "n6", title: "Review — gate on verdict", role: "supervisor", status: "pending", depth: 0, est: "—" },
    { id: "n7", title: "Synthesis → decide on paper", role: "commander", status: "pending", depth: 0, est: "—" },
  ],
  edges: [
    ["n0", "n2"], ["n1", "n2"],
    ["n2", "n3"], ["n2", "n4"],
    ["n3", "n5"], ["n4", "n5"],
    ["n5", "n6"], ["n6", "n7"],
  ],
};

// Deep-extension nodes — appended after initial graph completes.
const MOCK_GRAPH_EXTENSION = {
  nodes: [
    { id: "n8", title: "Failure-mode audit (distractor density)", role: "worker", status: "pending", depth: 2, est: "5m", added: true },
    { id: "n9", title: "Cross-regime probe — 128k extrapolation", role: "worker", status: "pending", depth: 2, est: "9m", added: true },
    { id: "n10", title: "Re-gate", role: "supervisor", status: "pending", depth: 2, est: "—", added: true },
  ],
  edges: [["n7", "n8"], ["n7", "n9"], ["n8", "n10"], ["n9", "n10"]],
};

// Mock events — one Event union per line, shaped to match Event.ts variants.
// In a real run these arrive over WebSocket; here they're the script.
const MOCK_EVENTS = [
  { t: "00:00.12", type: "graph_init", from: "commander", text: "Initial task graph: 8 nodes, 3 depth-0 actions, 1 review gate." },
  { t: "00:00.42", type: "agent_spawn", from: "commander", agent: "worker", text: "Dispatching · w-01 · literature sweep" },
  { t: "00:00.58", type: "tool_started", from: "worker", tool: "web.search", args: { q: "content-routing prior attention long-context", k: 12 } },
  { t: "00:12.30", type: "tool_ok", from: "worker", tool: "web.search", summary: "12 hits — 3 directly relevant, 4 tangential, 5 off-topic." },
  { t: "00:12.44", type: "llm_delta", from: "worker", text: "Prior work converges on two axes: (i) hard top-k sparsity with hashing, (ii) learned soft routing via gated MoE. A content-conditioned prior over routing weights sits between these and has not been isolated as a standalone baseline." },
  { t: "00:31.02", type: "evaluation", from: "supervisor", status: "GREEN", feedback: "Sweep is honest. Gaps surfaced match my prior. Proceed." },
  { t: "00:31.20", type: "node_done", from: "commander", nodeId: "n0" },
  { t: "00:31.62", type: "agent_spawn", from: "commander", agent: "worker", text: "Dispatching · w-02 · formalize routing prior" },
  { t: "00:44.10", type: "llm_delta", from: "worker", text: "Let q_i ∈ R^d be the query at position i, and let K = {k_j} be the key set. Define a content prior π(j | q_i) = softmax(⟨W_π q_i, φ(k_j)⟩ / τ). Attention mass is then (1−λ)·π + λ·softmax(qk/√d). λ is learned per head." },
  { t: "01:02.88", type: "evaluation", from: "supervisor", status: "YELLOW", feedback: "Formalization is fine but τ and λ need an init schedule — current draft is underspecified." },
  { t: "01:04.11", type: "debate", from: "commander", text: "Pushback: underspecification is acceptable at this stage; we resolve it when the harness is wired." },
  { t: "01:05.40", type: "debate", from: "supervisor", text: "Disagree. Without a schedule the comparison is ill-defined — the reader will ask. Patching upstream is cheaper than reopening later." },
  { t: "01:06.78", type: "debate", from: "commander", text: "Granted. Inserting a sub-node on n1 for the init schedule." },
  { t: "01:08.04", type: "graph_change", from: "commander", text: "Inserting sub-node: init-schedule derivation → parent n1" },
  { t: "01:22.50", type: "evaluation", from: "supervisor", status: "GREEN", feedback: "Patched. Schedule: warm τ linearly from 2.0 to 0.5 over 20% of training; λ free from step 0." },
  { t: "01:22.78", type: "node_done", from: "commander", nodeId: "n1" },
  { t: "01:23.04", type: "agent_spawn", from: "commander", agent: "worker", text: "Dispatching · w-03 · eval harness" },
  { t: "01:24.10", type: "tool_started", from: "worker", tool: "fs.write", args: { path: "/harness/tasks.py" } },
  { t: "01:41.66", type: "tool_ok", from: "worker", tool: "fs.write", summary: "Wrote harness (RULER-lite subset, 32k ctx, 6 task families)." },
  { t: "01:42.00", type: "llm_delta", from: "worker", text: "Harness covers needle-in-haystack, variable-tracking, multi-hop retrieval, aggregation, code-span lookup, and a distractor-density stress task. Seeds fixed at {11, 23, 47} for all reported runs." },
];

Object.assign(window, {
  MOCK_TOPIC,
  MOCK_CLARIFICATIONS,
  MOCK_BRANCH,
  MOCK_GRAPH_INITIAL,
  MOCK_GRAPH_EXTENSION,
  MOCK_EVENTS,
});

// Lamplit Light model offerings shown on /ai (docs/features/ai-route.md).
//
// Snapshot of the AI project's generated data file, `js/ui/src/data/site.json`
// in lamplitlabs/ai at commit e14e339 (file generated 2026-09-16T10:29:28Z).
// Only the fields a buyer reads are copied: what the model is for, where it
// runs, how big it is, where to get it, and the release-gate numbers it was
// measured on - each with its measured date, so a reader can see how old the
// numbers are. The training recipe, prompts and judge internals stay in the AI
// project (docs/memory/2026-09-11-public-copy-describes-outcomes-not-method.md).
// Refresh this file from site.json after every training round; see
// docs/plans/2026-11-08-serve-ai-at-slash-ai.md for the steps.

export const aiDataSource = {
  repo: "lamplitlabs/ai",
  commit: "e14e339",
  file: "js/ui/src/data/site.json",
  generatedAt: "2026-09-16",
} as const;

/** Size of the scenario suite every release gate runs on. */
export const aiSuiteScenarios = 177;

export interface AiModelGate {
  key: string;
  label: string;
  /** Measured share, 0-1. */
  actual: number;
  /** Share needed to pass, 0-1. */
  threshold: number;
}

export interface AiModel {
  /** Stable id from site.json `name`. */
  id: string;
  label: string;
  line: string;
  edition: "browser" | "medium";
  pitch: string;
  paramsBillions: number;
  runsIn: string;
  /** Download or memory figure shown under "Size". */
  size: string;
  licence: string;
  /** Hugging Face model repo, e.g. lamplitlabs/licht-german-tutor. */
  hubRepo: string;
  /** Hugging Face Space where the browser edition can be tried, if any. */
  hubSpace?: string;
  /** Date (YYYY-MM-DD) the release gates were run. */
  measuredAt: string;
  release: boolean;
  gates: AiModelGate[];
}

const GATE_LABELS: Record<string, string> = {
  no_loop: "Never loops",
  not_truncated: "Finishes its answer",
  no_ai_talk: "No assistant talk",
  language_follows: "Answers in the asked language",
  facts: "Facts checked against the reference",
  shape: "Right shape for the task",
  lexicon: "Genders and plurals match the lexicon",
  export: "Browser export matches the trained weights",
};

function gates(values: Record<string, [actual: number, threshold: number]>): AiModelGate[] {
  return Object.entries(values).map(([key, [actual, threshold]]) => ({
    key,
    label: GATE_LABELS[key] ?? key,
    actual,
    threshold,
  }));
}

export const aiModels: AiModel[] = [
  {
    id: "light-german-tutor-v17",
    label: "Light German Tutor v17",
    line: "German tutor",
    edition: "browser",
    pitch:
      "A German tutor for A2-C1 learners and the telc / Goethe exams that runs entirely in your browser: the weights download once, nothing you type leaves your machine.",
    paramsBillions: 3,
    runsIn: "Browser (WebGPU in Chrome or Edge) · desktop · server",
    size: "2.1 GB download (q4) · 3.6 GB (q8)",
    licence: "Apache-2.0 (inherited from the base model)",
    hubRepo: "lamplitlabs/licht-german-tutor",
    hubSpace: "lamplitlabs/licht-german-tutor",
    measuredAt: "2026-09-12",
    release: true,
    gates: gates({
      no_loop: [1, 1],
      not_truncated: [0.9887, 0.97],
      no_ai_talk: [1, 1],
      language_follows: [0.9831, 0.9],
      facts: [0.9205, 0.85],
      shape: [0.8824, 0.8],
      lexicon: [0.9774, 0.95],
      export: [1, 1],
    }),
  },
  {
    id: "light-german-tutor-pro-v22",
    label: "Light German Tutor Medium v22",
    line: "German tutor",
    edition: "medium",
    pitch:
      "The same tutor at 8 billion parameters for a GPU server or a workstation: fuller explanations, C1 transformations and exam preparation, measured on the same suite.",
    paramsBillions: 8,
    runsIn: "GPU server · workstation (PyTorch)",
    size: "15.6 GB of weights · about 20 GB of memory",
    licence: "Apache-2.0 (inherited from the base model)",
    hubRepo: "lamplitlabs/licht-german-tutor-medium",
    measuredAt: "2026-09-15",
    release: true,
    gates: gates({
      no_loop: [1, 1],
      not_truncated: [1, 0.97],
      no_ai_talk: [1, 1],
      language_follows: [0.9944, 0.9],
      facts: [0.9272, 0.85],
      shape: [0.9412, 0.8],
      lexicon: [0.9944, 0.95],
    }),
  },
];

export const huggingFaceModelUrl = (repo: string) => `https://huggingface.co/${repo}`;
export const huggingFaceSpaceUrl = (space: string) => `https://huggingface.co/spaces/${space}`;

/** "92.1%" - one decimal, the way the AI site prints gate shares. */
export function formatShare(value: number): string {
  return `${(Math.round(value * 1000) / 10).toFixed(1)}%`;
}

export function gatesPassed(model: AiModel): number {
  return model.gates.filter((gate) => gate.actual >= gate.threshold).length;
}

export function factsGate(model: AiModel): AiModelGate | undefined {
  return model.gates.find((gate) => gate.key === "facts");
}

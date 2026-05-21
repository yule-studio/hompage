/**
 * Plan Snapshot — yule-studio-agent 의 `DailyPlan.to_dict()` 가 produce 하는
 * JSON 을 그대로 받는 read-only 타입. agent 가 cron 으로 만들어
 * `public/plan-snapshot.json` 에 push 하면 hompage 는 fetch 만.
 *
 * 전체 필드 중 hompage UI 가 실제 쓰는 부분만 surface. 나머지는 무시 — agent
 * 의 model evolution 에 hompage 가 영향 받지 않게.
 */

/* ── 시간 블록 (fixed_schedule / suggested_time_blocks) ───── */
export type PlanTimeBlock = {
  start: string;
  end: string;
  block_type: string;
  title: string;
  task_id?: string | null;
  locked: boolean;
};

/* ── 우선순위 작업 (prioritized_tasks) ────────────────────── */
export type PlanTaskCandidate = {
  task_id: string;
  source_type: string;
  title: string;
  description: string;
  due_date: string | null;
  priority_score: number;
  priority_level: string;
  estimated_minutes: number;
  reasons: string[];
  coding_candidate: boolean;
  category_color?: string | null;
  category_label?: string | null;
  flexible?: boolean;
};

/* ── 실행 블록 (execution_blocks) ─────────────────────────── */
export type PlanExecutionBlock = {
  block_id: string;
  start: string;
  end: string;
  title: string;
  task_ids: string[];
  briefing?: string;
};

/* ── 요약 카운트 (summary) ────────────────────────────────── */
export type PlanSummary = {
  fixed_event_count: number;
  all_day_event_count: number;
  todo_count: number;
  github_issue_count: number;
  reminder_count: number;
  recommended_task_count: number;
  available_focus_minutes: number;
};

/* ── 소스 상태 (source_statuses) ──────────────────────────── */
export type PlanSourceStatus = {
  source: string;
  ok: boolean;
  detail?: string;
  fetched_at?: string;
};

/* ── 체크포인트 ───────────────────────────────────────────── */
export type PlanCheckpoint = {
  time: string;
  title: string;
  note?: string;
};

/* ── 전체 snapshot (agent → hompage) ──────────────────────── */
export type PlanSnapshot = {
  plan_date: string;
  timezone: string;
  generated_at?: string | null;
  source_statuses: PlanSourceStatus[];
  warnings: string[];
  summary: PlanSummary;
  fixed_schedule: PlanTimeBlock[];
  execution_blocks: PlanExecutionBlock[];
  prioritized_tasks: PlanTaskCandidate[];
  suggested_time_blocks: PlanTimeBlock[];
  checkpoints: PlanCheckpoint[];
  morning_briefing: string;
  discord_briefing: string;
};

export const planSnapshotFallback: PlanSnapshot = {
  plan_date: "",
  timezone: "Asia/Seoul",
  generated_at: null,
  source_statuses: [],
  warnings: [],
  summary: {
    fixed_event_count: 0,
    all_day_event_count: 0,
    todo_count: 0,
    github_issue_count: 0,
    reminder_count: 0,
    recommended_task_count: 0,
    available_focus_minutes: 0,
  },
  fixed_schedule: [],
  execution_blocks: [],
  prioritized_tasks: [],
  suggested_time_blocks: [],
  checkpoints: [],
  morning_briefing: "",
  discord_briefing: "",
};

/* ── normalizer ──────────────────────────────────────────── */
function asString(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}
function asNumber(v: unknown, fallback = 0): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}
function asBool(v: unknown, fallback = false): boolean {
  return typeof v === "boolean" ? v : fallback;
}
function asArr(v: unknown): unknown[] {
  return Array.isArray(v) ? v : [];
}
function asObj(v: unknown): Record<string, unknown> {
  return v && typeof v === "object" && !Array.isArray(v)
    ? (v as Record<string, unknown>)
    : {};
}

function normalizeTimeBlock(raw: unknown): PlanTimeBlock | null {
  const r = asObj(raw);
  if (!r.start || !r.end) return null;
  return {
    start: asString(r.start),
    end: asString(r.end),
    block_type: asString(r.block_type, "fixed"),
    title: asString(r.title),
    task_id: typeof r.task_id === "string" ? r.task_id : null,
    locked: asBool(r.locked),
  };
}

function normalizeTask(raw: unknown): PlanTaskCandidate | null {
  const r = asObj(raw);
  if (!r.task_id || !r.title) return null;
  return {
    task_id: asString(r.task_id),
    source_type: asString(r.source_type, "unknown"),
    title: asString(r.title),
    description: asString(r.description),
    due_date: typeof r.due_date === "string" ? r.due_date : null,
    priority_score: asNumber(r.priority_score),
    priority_level: asString(r.priority_level, "medium"),
    estimated_minutes: asNumber(r.estimated_minutes, 30),
    reasons: asArr(r.reasons).map((x) => asString(x)).filter(Boolean),
    coding_candidate: asBool(r.coding_candidate),
    category_color: typeof r.category_color === "string" ? r.category_color : null,
    category_label: typeof r.category_label === "string" ? r.category_label : null,
    flexible: asBool(r.flexible),
  };
}

function normalizeExecBlock(raw: unknown): PlanExecutionBlock | null {
  const r = asObj(raw);
  if (!r.block_id || !r.start || !r.end) return null;
  return {
    block_id: asString(r.block_id),
    start: asString(r.start),
    end: asString(r.end),
    title: asString(r.title),
    task_ids: asArr(r.task_ids).map((x) => asString(x)).filter(Boolean),
    briefing: typeof r.briefing === "string" ? r.briefing : undefined,
  };
}

function normalizeStatus(raw: unknown): PlanSourceStatus | null {
  const r = asObj(raw);
  if (!r.source) return null;
  return {
    source: asString(r.source),
    ok: asBool(r.ok, true),
    detail: typeof r.detail === "string" ? r.detail : undefined,
    fetched_at: typeof r.fetched_at === "string" ? r.fetched_at : undefined,
  };
}

function normalizeCheckpoint(raw: unknown): PlanCheckpoint | null {
  const r = asObj(raw);
  if (!r.time || !r.title) return null;
  return {
    time: asString(r.time),
    title: asString(r.title),
    note: typeof r.note === "string" ? r.note : undefined,
  };
}

export function normalizePlanSnapshot(raw: unknown): PlanSnapshot {
  if (!raw || typeof raw !== "object") return planSnapshotFallback;
  const r = raw as Record<string, unknown>;

  // agent 의 root 가 envelope (DailyPlanEnvelope.to_dict()) 일 수도.
  const plan = (r.daily_plan && typeof r.daily_plan === "object")
    ? (r.daily_plan as Record<string, unknown>)
    : r;

  const summary = asObj(plan.summary);
  return {
    plan_date: asString(plan.plan_date),
    timezone: asString(plan.timezone, "Asia/Seoul"),
    generated_at: typeof r.generated_at === "string" ? r.generated_at : null,
    source_statuses: asArr(plan.source_statuses)
      .map(normalizeStatus)
      .filter((s): s is PlanSourceStatus => s !== null),
    warnings: asArr(plan.warnings).map((x) => asString(x)).filter(Boolean),
    summary: {
      fixed_event_count: asNumber(summary.fixed_event_count),
      all_day_event_count: asNumber(summary.all_day_event_count),
      todo_count: asNumber(summary.todo_count),
      github_issue_count: asNumber(summary.github_issue_count),
      reminder_count: asNumber(summary.reminder_count),
      recommended_task_count: asNumber(summary.recommended_task_count),
      available_focus_minutes: asNumber(summary.available_focus_minutes),
    },
    fixed_schedule: asArr(plan.fixed_schedule)
      .map(normalizeTimeBlock)
      .filter((b): b is PlanTimeBlock => b !== null),
    execution_blocks: asArr(plan.execution_blocks)
      .map(normalizeExecBlock)
      .filter((b): b is PlanExecutionBlock => b !== null),
    prioritized_tasks: asArr(plan.prioritized_tasks)
      .map(normalizeTask)
      .filter((t): t is PlanTaskCandidate => t !== null),
    suggested_time_blocks: asArr(plan.suggested_time_blocks)
      .map(normalizeTimeBlock)
      .filter((b): b is PlanTimeBlock => b !== null),
    checkpoints: asArr(plan.checkpoints)
      .map(normalizeCheckpoint)
      .filter((c): c is PlanCheckpoint => c !== null),
    morning_briefing: asString(plan.morning_briefing),
    discord_briefing: asString(plan.discord_briefing),
  };
}

/* ── helpers ─────────────────────────────────────────────── */
export function formatTimeRange(start: string, end: string): string {
  const s = new Date(start);
  const e = new Date(end);
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) {
    return `${start} – ${end}`;
  }
  const fmt = (d: Date) =>
    `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  return `${fmt(s)}–${fmt(e)}`;
}

export function isPlanForToday(snapshot: PlanSnapshot, today = new Date()): boolean {
  if (!snapshot.plan_date) return false;
  const todayYmd = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  return snapshot.plan_date === todayYmd;
}

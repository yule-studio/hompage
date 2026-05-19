export type Event = {
  date: string;       /* YYYY-MM-DD */
  time?: string;      /* HH:mm */
  title: string;
  kind: "talk" | "stream" | "ship" | "maintenance" | "personal";
  link?: string;
};

export const events: Event[] = [
  { date: "2026-05-22", time: "20:00", title: "Stream — homelab GitOps 라이브",   kind: "stream" },
  { date: "2026-05-25",                title: "Ship — yule-studio-agent v0.6",     kind: "ship" },
  { date: "2026-05-28", time: "10:00", title: "Talk — \"LLM 에이전트 운영의 함정\"", kind: "talk" },
  { date: "2026-06-02", time: "01:00", title: "Maintenance — k3s 1.30 → 1.31",      kind: "maintenance" },
  { date: "2026-06-10",                title: "Ship — hompage v1.0 (디자인 다듬기)",  kind: "ship" },
];

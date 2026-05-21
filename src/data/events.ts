export type EventKind = "talk" | "stream" | "ship" | "maintenance" | "personal";

export type Event = {
  date: string;       /* YYYY-MM-DD */
  time?: string;      /* HH:mm */
  duration?: string;  /* "120m" / "45m" / "1h" */
  title: string;
  kind: EventKind;
  meta?: string;      /* "twitch · public" 같은 부가 정보 */
  note?: string;      /* 한 줄 설명 */
  link?: string;
};

export const events: Event[] = [
  {
    date: "2026-05-22",
    time: "20:00",
    duration: "120m",
    title: "Stream — homelab GitOps 라이브",
    kind: "stream",
    meta: "twitch · public",
    note: "ArgoCD 동기화 / 무중단 배포 데모",
  },
  {
    date: "2026-05-25",
    title: "Ship — yule-studio-agent v0.6",
    kind: "ship",
    meta: "release · semver",
    note: "사용자 메모리 컨텍스트 압축 / Tools rework",
  },
  {
    date: "2026-05-28",
    time: "10:00",
    duration: "45m",
    title: "Talk — \"LLM 에이전트 운영의 함정\"",
    kind: "talk",
    meta: "사내 · zoom",
    note: "관측성 · 비용 · 안전 가드레일",
  },
  {
    date: "2026-06-02",
    time: "01:00",
    duration: "30m",
    title: "Maintenance — k3s 1.30 → 1.31",
    kind: "maintenance",
    meta: "homelab · 새벽 점검",
    note: "drain → upgrade → verify · 다운타임 ~10m",
  },
  {
    date: "2026-06-10",
    title: "Ship — hompage v1.0 (디자인 다듬기)",
    kind: "ship",
    meta: "release · public",
    note: "타이포 / 컬러 / 모션 마이크로 튜닝",
  },
];

export type Post = {
  slug: string;
  title: string;
  date: string;     /* YYYY-MM-DD */
  summary: string;
  tags: string[];
  readMin: number;
};

export const posts: Post[] = [
  {
    slug: "claude-agent-discord-intake",
    title: "Discord-first 코딩 에이전트의 intake 설계",
    date: "2026-05-12",
    summary:
      "강제 슬래시 명령 대신 자연어 대화를 1차 채널로 두고, 실행이 필요한 작업만 intake 로 승격하는 흐름.",
    tags: ["agent", "discord", "ux"],
    readMin: 7,
  },
  {
    slug: "k3s-vs-eks-self-host",
    title: "k3s self-host vs EKS — 50 노드 전후의 결정",
    date: "2026-05-02",
    summary:
      "control plane 비용 $73 vs 운영 인건비. 마이그레이션 임계 7 조건과 함께 정리.",
    tags: ["k3s", "kubernetes", "ops"],
    readMin: 9,
  },
  {
    slug: "obsidian-vault-as-second-brain",
    title: "Obsidian Vault 를 운영 메모리로",
    date: "2026-04-20",
    summary:
      "20-areas / 40-patterns / 60-troubleshooting 의 디렉토리 정책과 \"왜 4구조\" 메모리 룰.",
    tags: ["obsidian", "knowledge"],
    readMin: 6,
  },
  {
    slug: "good-vs-bad-oop-backend",
    title: "백엔드 OOP — 좋은 / 나쁜 코드 비교 3 케이스",
    date: "2026-04-08",
    summary:
      "주문 / 결제 / 알림 도메인의 anemic vs rich domain 코드 차이.",
    tags: ["oop", "backend", "ddd"],
    readMin: 8,
  },
  {
    slug: "spring-observability-end-to-end",
    title: "Spring observability — Logback ⇢ ELK ⇢ Grafana ⇢ Discord",
    date: "2026-03-28",
    summary:
      "MDC + Logback rolling + Logstash + Actuator + Prometheus + Grafana Alert 까지.",
    tags: ["spring", "observability", "grafana"],
    readMin: 11,
  },
];

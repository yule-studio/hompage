export type Project = {
  slug: string;
  name: string;
  summary: string;
  status: "active" | "shipped" | "paused" | "archived";
  tags: string[];
  url?: string;
  repo?: string;
  year: number;
};

export const projects: Project[] = [
  {
    slug: "yule-studio-agent",
    name: "yule-studio-agent",
    summary: "Discord-first 엔지니어링 / 플래닝 에이전트. intake → approval → PR 까지 자율 처리.",
    status: "active",
    tags: ["python", "discord", "llm", "automation"],
    repo: "https://github.com/yule-studio/yule-studio-agent",
    year: 2026,
  },
  {
    slug: "yule-agent-vault",
    name: "yule-agent-vault",
    summary: "Obsidian 기반 개인 지식 / 운영 메모리. CS·DevOps·OOP 영역 별 깊이 노트.",
    status: "active",
    tags: ["obsidian", "knowledge-graph", "markdown"],
    repo: "https://github.com/yule-studio/yule-agent-vault",
    year: 2026,
  },
  {
    slug: "homelab",
    name: "homelab",
    summary: "Proxmox + k3s + Cloudflare Tunnel. self-host 서비스 + GitOps 배포.",
    status: "active",
    tags: ["k3s", "proxmox", "gitops", "cloudflare"],
    year: 2025,
  },
  {
    slug: "hompage",
    name: "hompage",
    summary: "지금 보고 계신 이 사이트. Vite + React + 다크 대시보드 디자인.",
    status: "active",
    tags: ["vite", "react", "typescript"],
    repo: "https://github.com/yule-studio/hompage",
    year: 2026,
  },
  {
    slug: "bkurs-fe",
    name: "bkurs-fe",
    summary: "교육 도메인 프런트엔드 재구성. 4 role 페이지 + 디자인 시스템 도입.",
    status: "paused",
    tags: ["react", "next.js", "design-system"],
    year: 2025,
  },
  {
    slug: "naver-search-clone",
    name: "naver-search-clone",
    summary: "검색 결과 페이지 모사 + 자율 intake 실험. 사고 사례는 troubleshooting 노트.",
    status: "archived",
    tags: ["experiment", "scraping", "discord-bot"],
    year: 2025,
  },
];

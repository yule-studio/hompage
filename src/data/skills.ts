export type Skill = { name: string; level: number /* 0-100 */; note?: string };
export type SkillGroup = { group: string; items: Skill[] };

export const skills: SkillGroup[] = [
  {
    group: "Languages",
    items: [
      { name: "Java", level: 92, note: "Spring Boot · 백엔드 메인" },
      { name: "Python", level: 80, note: "agent / data / FastAPI" },
      { name: "TypeScript", level: 74, note: "React / Node" },
      { name: "Go", level: 58 },
      { name: "Rust", level: 34 },
    ],
  },
  {
    group: "Backend",
    items: [
      { name: "Spring Boot", level: 92, note: "JPA · Batch · WebSocket" },
      { name: "PostgreSQL", level: 85 },
      { name: "Redis", level: 80 },
      { name: "Kafka", level: 66 },
      { name: "FastAPI", level: 74 },
    ],
  },
  {
    group: "DevOps",
    items: [
      { name: "Docker", level: 93 },
      { name: "GitHub Actions", level: 90 },
      { name: "Kubernetes / k3s", level: 88 },
      { name: "Prometheus + Grafana", level: 82 },
      { name: "Terraform", level: 80 },
    ],
  },
  {
    group: "AI / Agents",
    items: [
      { name: "LLM API (Anthropic / OpenAI)", level: 78 },
      { name: "Agent runtime / tool calling", level: 72 },
      { name: "Prompt engineering", level: 66 },
      { name: "RAG / vector store", level: 58 },
    ],
  },
];

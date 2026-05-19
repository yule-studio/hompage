export type Skill = { name: string; level: number /* 0-100 */; note?: string };
export type SkillGroup = { group: string; items: Skill[] };

export const skills: SkillGroup[] = [
  {
    group: "Languages",
    items: [
      { name: "Python", level: 92, note: "agent / data / FastAPI" },
      { name: "TypeScript", level: 80, note: "React / Node" },
      { name: "Java", level: 70, note: "Spring Boot" },
      { name: "Go", level: 55 },
      { name: "Rust", level: 35 },
    ],
  },
  {
    group: "Backend",
    items: [
      { name: "FastAPI", level: 88 },
      { name: "Spring Boot", level: 72 },
      { name: "PostgreSQL", level: 80 },
      { name: "Redis", level: 75 },
      { name: "Kafka", level: 50 },
    ],
  },
  {
    group: "DevOps",
    items: [
      { name: "Docker", level: 90 },
      { name: "Kubernetes / k3s", level: 78 },
      { name: "Terraform", level: 65 },
      { name: "GitHub Actions", level: 85 },
      { name: "Prometheus + Grafana", level: 70 },
    ],
  },
  {
    group: "AI / Agents",
    items: [
      { name: "LLM API (Anthropic / OpenAI)", level: 85 },
      { name: "Agent runtime / tool calling", level: 80 },
      { name: "RAG / vector store", level: 65 },
      { name: "Prompt engineering", level: 75 },
    ],
  },
];

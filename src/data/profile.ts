const githubUsername = "codwithyc";

export type ProfileExperience = {
  org: string;
  role: string;
  period: string;
  link?: string;
  bullets: string[];
};

export type ProfileEducation = {
  org: string;
  period: string;
  link?: string;
  bullet: string;
};

export const profile = {
  handle: "yuchan.oh",
  name: "Oh Yuchan",
  role: "Backend Developer & DevOps Engineer",
  location: "Seoul, KR",
  status: { label: "Available · Q3 2026", tone: "ok" as const },
  bio:
    "백엔드 / 인프라 / 자율 에이전트를 짓습니다. " +
    "최근에는 LLM 코딩 에이전트와 self-host 홈랩 자동화에 시간을 쏟고 있어요.",
  phone: "",
  phoneDisplay: "",
  emailDisplay: "oyuchan50@gmail.com",
  links: {
    email: "mailto:oyuchan50@gmail.com",
    github: `https://github.com/${githubUsername}`,
    blog: "https://codingtips.tistory.com/",
    instagram: "https://www.instagram.com/oyuchan50/",
    linkedin: "https://www.linkedin.com/in/ohyuchan/",
  },
  githubUsername,
  avatarUrl: `https://github.com/${githubUsername}.png?size=512`,
  uptimeDays: 412,
  region: "home / seoul",
  experience: [
    {
      org: "마스터웨이 (Masterway)",
      role: "백엔드 개발자 정규직",
      period: "2025.05 ~ ing",
      bullets: [
        "Spring Boot 기반 백엔드 개발",
        "AWS, Docker, Nginx 기반 서비스 운영 및 배포",
      ],
    },
    {
      org: "에티포스 (Ettifos)",
      role: "네트워크 엔지니어 현장실습생",
      period: "2023.11 ~ 2024.01",
      bullets: ["네트워크 엔지니어 현장실습"],
    },
  ] as ProfileExperience[],
  education: [
    {
      org: "LG 유플러스 유레카 SW 교육과정",
      period: "2024.06 ~ 2024.12",
      bullet: "백엔드 Java 과정 학습 및 팀 프로젝트 진행",
    },
    {
      org: "광주소프트웨어 마이스터고등학교",
      period: "2021.03 ~ 2024.01",
      bullet: "소프트웨어 개발 기초 및 전공 교육과정 이수",
    },
  ] as ProfileEducation[],
};

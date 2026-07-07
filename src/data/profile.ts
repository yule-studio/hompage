const githubUsername = "codwithyc";

export type ProfileExperience = {
  org: string;
  role: string;
  period: string;
  link?: string;
};

export type ProfileEducation = {
  org: string;
  period: string;
  link?: string;
};

export const profile = {
  handle: "yuchan.oh",
  name: "Oh Yuchan",
  role: "Backend Developer & DevOps Engineer",
  location: "Seoul, KR",
  status: { label: "Available · Q3 2026", tone: "ok" as const },
  bio:
    "백엔드와 인프라를 기반으로 개발 자동화 시스템을 만들고 있습니다. " +
    "최근에는 AI를 활용한 자율 개발 에이전트와 self-host 홈랩 자동화를 실험하며, " +
    "여러 기술 분야를 넘나드는 경험을 쌓고 있습니다.",
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
    },
    {
      org: "에티포스 (Ettifos)",
      role: "네트워크 엔지니어 현장실습생",
      period: "2023.11 ~ 2024.01",
    },
  ] as ProfileExperience[],
  education: [
    {
      org: "LG 유플러스 유레카 SW 교육과정",
      period: "2024.06 ~ 2024.12",
    },
    {
      org: "광주소프트웨어 마이스터고등학교",
      period: "2021.03 ~ 2024.01",
    },
  ] as ProfileEducation[],
};

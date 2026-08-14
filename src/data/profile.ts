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
  /** self-description — currently not rendered; kept for when About wants prose again */
  about:
    "모르는 것을 그냥 넘기지 않고, 직접 파고들어 구조를 이해한 뒤 자신의 방식으로 " +
    "해결책을 만들어내는 사람입니다. 개발과 인프라를 넘어 자신의 커리어와 삶까지 " +
    "하나의 시스템처럼 설계하며, 배운 것을 실제 결과로 연결하면서 계속 성장하는 " +
    "사람이라고 표현할 수 있습니다.",
  /** the quote block in the About section */
  tagline: "No amount of money ever bought a second of time.",
  taglineKo: "아무리 많은 돈도 단 1초의 시간을 살 수는 없다.",
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

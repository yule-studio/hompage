export type Award = {
  year: number;
  title: string;
  org: string;
  note?: string;
};

export const awards: Award[] = [
  { year: 2023, title: "지방 기능 경기 대회 장려상", org: "마이스터넷", note: "모바일로보틱스 부분 장려상" },
  // { year: 2024, title: "Best Internal Tool", org: "OO Company", note: "Discord 에이전트 — 운영 효율 +28%" },
  // { year: 2023, title: "Hackathon — 2nd place", org: "Seoul Cloud Day", note: "ML 추론 비용 절감 데모" },
  // { year: 2022, title: "Top contributor", org: "OSS K8s tools", note: "k3s ecosystem PR 12 건" },
];

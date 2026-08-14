export type Cert = {
  name: string;
  issuer: string;
  year: number;
  status: "active" | "expired" | "in-progress";
  id?: string;
};

export const certs: Cert[] = [
  { name: "토익 990", issuer: "토익", year: 2026, status: "in-progress", id: "토익" },
  { name: "JLPT N1", issuer: "일본어능력시험", year: 2026, status: "in-progress", id: "JLPT-N1" },
  { name: "한국능력검정능력 1급", issuer: "한국능력검정협회", year: 2026, status: "active", id: "한국능력검정능력-1급" },
  { name: "컴활 1급", issuer: "대한상공회의소", year: 2026, status: "active", id: "컴활 1급" },
  { name: "네트워크 관리사 2급", issuer: "한국정보통신협회", year: 2024, status: "active", id: "네트워크 관리사 2급" },
  { name: "정보처리기사", issuer: "한국산업인력공단", year: 2024, status: "active", id: "정보처리기사" },
  { name: "리눅스 마스터 1급", issuer: "한국정보통신진흥협회(KAIT)", year: 2025, status: "active", id: "리눅스 마스터 1급" },
  { name: "ADsP",     issuer: "한국데이터산업진흥원", year: 2026, status: "active", id: "ADsP" },
  { name: "Solutions Architect — Associate-C03",     issuer: "AWS", year: 2024, status: "active", id: "AWS-SAA-C03" },
  { name: "SQLP", issuer: "한국데이터산업진흥원", year: 2026, status: "active", id: "SQLP" },
  { name: "SQLD", issuer: "한국데이터산업진흥원", year: 2024, status: "active", id: "SQLD" },
  { name: "정보처리산업기사", issuer: "한국산업인력공단", year: 2024, status: "active", id: "정보처리산업기사" },
  { name: "컴활 2급", issuer: "대한상공회의소", year: 2021, status: "active", id: "컴활 2급" },
  { name: "정보처리기능사",issuer: "한국산업인력공단", year: 2021, status: "active", id: "정보처리기능사" },
];

export type Cert = {
  name: string;
  issuer: string;
  year: number;
  status: "active" | "expired" | "in-progress";
  id?: string;
};

export const certs: Cert[] = [
  { name: "CKA (Certified Kubernetes Administrator)", issuer: "CNCF / Linux Foundation", year: 2025, status: "active", id: "CKA-2025-0832" },
  { name: "AWS Solutions Architect — Associate",     issuer: "AWS",                       year: 2024, status: "active", id: "AWS-SAA-C03" },
  { name: "Terraform Associate",                       issuer: "HashiCorp",                 year: 2024, status: "active" },
  { name: "CKAD (Application Developer)",              issuer: "CNCF",                      year: 2026, status: "in-progress" },
  { name: "정보처리기사",                                  issuer: "한국산업인력공단",                year: 2021, status: "active" },
];

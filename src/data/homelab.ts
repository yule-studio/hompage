export type Host = {
  name: string;
  role: string;
  status: "ok" | "warn" | "err";
  cpu: number; /* 0-100 */
  mem: number; /* 0-100 */
  uptime: string;
};

export type Service = {
  name: string;
  host: string;
  status: "ok" | "warn" | "err";
  url?: string;
};

export const hosts: Host[] = [
  { name: "pve-01",  role: "Proxmox node",   status: "ok",   cpu: 18, mem: 42, uptime: "47d 03h" },
  { name: "k3s-cp",  role: "k3s control",    status: "ok",   cpu: 22, mem: 51, uptime: "47d 03h" },
  { name: "k3s-w1",  role: "k3s worker",     status: "ok",   cpu: 31, mem: 64, uptime: "47d 03h" },
  { name: "k3s-w2",  role: "k3s worker",     status: "warn", cpu: 74, mem: 81, uptime: "12d 11h" },
  { name: "nas-01",  role: "Storage / TrueNAS", status: "ok", cpu: 9,  mem: 28, uptime: "112d 04h" },
  { name: "edge-01", role: "Cloudflare tunnel", status: "ok", cpu: 4,  mem: 12, uptime: "78d 21h" },
];

export const services: Service[] = [
  { name: "Grafana",     host: "k3s-w1", status: "ok",   url: "https://grafana.yule.local" },
  { name: "Prometheus",  host: "k3s-w1", status: "ok" },
  { name: "Loki",        host: "k3s-w1", status: "ok" },
  { name: "PostgreSQL",  host: "k3s-w2", status: "warn" },
  { name: "Redis",       host: "k3s-w2", status: "ok" },
  { name: "ArgoCD",      host: "k3s-cp", status: "ok",   url: "https://argo.yule.local" },
  { name: "Vault",       host: "k3s-cp", status: "ok" },
  { name: "Cloudflared", host: "edge-01", status: "ok" },
];

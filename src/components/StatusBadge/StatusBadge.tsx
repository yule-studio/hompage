type Status = "ok" | "warn" | "err" | "info" | "muted";

type Props = {
  status?: Status;
  label: string;
  title?: string;
};

export default function StatusBadge({ status = "muted", label, title }: Props) {
  return (
    <span
      className="badge"
      data-status={status === "muted" ? undefined : status}
      title={title}
    >
      <span className="badge-dot" aria-hidden />
      <span>{label}</span>
    </span>
  );
}

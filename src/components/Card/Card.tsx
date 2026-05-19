import { ReactNode } from "react";

export type CardSpan = "sm" | "md" | "lg" | "xl" | "wide" | "tall";

type Props = {
  children: ReactNode;
  span?: CardSpan;
  hoverable?: boolean;
  as?: "article" | "section" | "div";
  className?: string;
  ariaLabel?: string;
};

export default function Card({
  children,
  span = "sm",
  hoverable = false,
  as: Tag = "article",
  className,
  ariaLabel,
}: Props) {
  return (
    <Tag
      className={["card", className].filter(Boolean).join(" ")}
      data-span={span}
      data-hoverable={hoverable ? "true" : undefined}
      aria-label={ariaLabel}
    >
      {children}
    </Tag>
  );
}

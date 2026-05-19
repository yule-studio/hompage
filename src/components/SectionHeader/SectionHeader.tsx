import { ReactNode } from "react";

type Props = {
  title: string;
  meta?: ReactNode;
};

export default function SectionHeader({ title, meta }: Props) {
  return (
    <div className="section-header">
      <h2>{title}</h2>
      {meta ? <span className="section-meta">{meta}</span> : null}
    </div>
  );
}

import { ReactNode } from "react";

type Line =
  | { kind: "cmd"; text: string }
  | { kind: "out"; text: string }
  | { kind: "comment"; text: string };

type Props = {
  title?: string;
  lines: Line[];
  span?: "sm" | "md" | "lg" | "xl" | "wide" | "tall";
  children?: ReactNode;
};

export default function TerminalCard({ title = "~/yule.studio", lines, span = "md" }: Props) {
  return (
    <article className="card term" data-span={span} aria-label="terminal preview">
      <div className="term-bar">
        <span className="term-dot r" />
        <span className="term-dot y" />
        <span className="term-dot g" />
        <span className="term-comment" style={{ marginLeft: 8 }}>
          {title}
        </span>
      </div>
      {lines.map((ln, i) => {
        if (ln.kind === "cmd") {
          return (
            <div key={i} className="term-row">
              <span className="term-prompt">$</span>
              <span>{ln.text}</span>
            </div>
          );
        }
        if (ln.kind === "comment") {
          return (
            <div key={i} className="term-row term-comment">
              <span># {ln.text}</span>
            </div>
          );
        }
        return (
          <div key={i} className="term-row">
            <span>{ln.text}</span>
          </div>
        );
      })}
    </article>
  );
}

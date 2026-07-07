import { useEffect, useState } from "react";

type TypeCycleProps = {
  words: string[];
  typeSpeed?: number;
  deleteSpeed?: number;
  pause?: number;
};

/**
 * TypeCycle — minimal typewriter that types/deletes through `words`,
 * looping forever, with a blinking underscore cursor. No deps.
 */
export function TypeCycle({ words, typeSpeed = 75, deleteSpeed = 45, pause = 1500 }: TypeCycleProps) {
  const [text, setText] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const word = words[wordIndex % words.length];

    if (!deleting && text === word) {
      const t = window.setTimeout(() => setDeleting(true), pause);
      return () => window.clearTimeout(t);
    }
    if (deleting && text === "") {
      setDeleting(false);
      setWordIndex((i) => i + 1);
      return;
    }
    const t = window.setTimeout(
      () => setText(deleting ? word.slice(0, text.length - 1) : word.slice(0, text.length + 1)),
      deleting ? deleteSpeed : typeSpeed,
    );
    return () => window.clearTimeout(t);
  }, [text, deleting, wordIndex, words, typeSpeed, deleteSpeed, pause]);

  return (
    <span>
      {text}
      <span className="type-cursor" aria-hidden>_</span>
    </span>
  );
}

export default TypeCycle;

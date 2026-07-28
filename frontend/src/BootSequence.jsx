import { useState, useEffect } from "react";

const LINES = [
  "booting cap_detector kernel...",
  "mounting /judge/cpp ................. ok",
  "mounting /judge/python .............. ok",
  "loading concept graph ............... ok",
  "connecting to groq inference ......... ok",
  "initializing 3d render pipeline ...... ok",
  "> welcome back, developer_",
];

function BootSequence({ onDone }) {
  const [visibleLines, setVisibleLines] = useState([]);
  const [charIndex, setCharIndex] = useState(0);
  const [lineIndex, setLineIndex] = useState(0);

  useEffect(() => {
    if (lineIndex >= LINES.length) {
      const t = setTimeout(onDone, 500);
      return () => clearTimeout(t);
    }
    const currentLine = LINES[lineIndex];
    if (charIndex < currentLine.length) {
      const t = setTimeout(() => setCharIndex(charIndex + 1), 12);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => {
        setVisibleLines((prev) => [...prev, currentLine]);
        setLineIndex(lineIndex + 1);
        setCharIndex(0);
      }, 150);
      return () => clearTimeout(t);
    }
  }, [charIndex, lineIndex]);

  return (
    <div className="boot-overlay">
      <div className="boot-box">
        {visibleLines.map((l, i) => (
          <div key={i} className="boot-line">{l}</div>
        ))}
        {lineIndex < LINES.length && (
          <div className="boot-line">
            {LINES[lineIndex].slice(0, charIndex)}
            <span className="boot-caret">█</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default BootSequence;
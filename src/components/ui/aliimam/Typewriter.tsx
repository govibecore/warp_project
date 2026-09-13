import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface TypewriterProps {
  text?: string;
  words?: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseDuration?: number;
  className?: string;
  cursor?: boolean;
  cursorChar?: string;
  loop?: boolean;
}

export function Typewriter({
  text,
  words,
  typingSpeed = 90,
  deletingSpeed = 45,
  pauseDuration = 2200,
  className,
  cursor = true,
  cursorChar = "_",
  loop = true,
}: TypewriterProps) {
  const wordList = words && words.length > 0 ? words : [text || "Close the gap."];
  const [wordIndex, setWordIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentWord = wordList[wordIndex % wordList.length];

    if (!isDeleting) {
      if (displayedText.length < currentWord.length) {
        const timeout = setTimeout(() => {
          setDisplayedText(currentWord.slice(0, displayedText.length + 1));
        }, typingSpeed);
        return () => clearTimeout(timeout);
      } else {
        if (!loop && wordIndex === wordList.length - 1) return;
        const timeout = setTimeout(() => {
          setIsDeleting(true);
        }, pauseDuration);
        return () => clearTimeout(timeout);
      }
    } else {
      if (displayedText.length > 0) {
        const timeout = setTimeout(() => {
          setDisplayedText(currentWord.slice(0, displayedText.length - 1));
        }, deletingSpeed);
        return () => clearTimeout(timeout);
      } else {
        setIsDeleting(false);
        setWordIndex((prev) => (prev + 1) % wordList.length);
      }
    }
  }, [displayedText, isDeleting, wordIndex, wordList, typingSpeed, deletingSpeed, pauseDuration, loop]);

  return (
    <span className={cn("inline-flex items-baseline whitespace-nowrap", className)}>
      <span>{displayedText || "\u00A0"}</span>
      {cursor && (
        cursorChar && cursorChar !== "_" && cursorChar !== "|" ? (
          <span className="ml-1.5 inline-block animate-pulse font-mono font-normal text-primary select-none">
            {cursorChar}
          </span>
        ) : (
          <span
            className="ml-2 inline-block w-[3.5px] h-[0.82em] bg-primary align-baseline -translate-y-0.5 animate-pulse select-none"
            aria-hidden="true"
          />
        )
      )}
    </span>
  );
}

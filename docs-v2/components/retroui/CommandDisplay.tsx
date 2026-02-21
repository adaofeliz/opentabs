"use client";

import { ClipboardIcon, CheckIcon } from "lucide-react";
import { useState } from "react";

interface CommandDisplayProps {
  command: string;
}

export function CommandDisplay({ command }: CommandDisplayProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const defaultColors = [
    "text-accent-foreground",
    "text-primary",
    "text-muted-foreground",
    "text-foreground",
  ];

  // Split the command into parts for syntax highlighting
  const parts = command.split(" ").map((part, index) => {
    const color = defaultColors[index % defaultColors.length];
    return (
      <span key={index} className={color}>
        {part}
      </span>
    );
  });

  return (
    <div className="relative group flex items-center bg-secondary pl-4 py-2 font-mono text-xs rounded-(--radius)">
      <div className="flex-1 whitespace-nowrap overflow-hidden">
        <div className="overflow-hidden text-ellipsis">
          {parts.map((part, index) => (
            <span key={`part-${index}`}>
              {part}
              {index < parts.length - 1 && " "}
            </span>
          ))}
        </div>
      </div>
      <button
        onClick={copyToClipboard}
        className="mr-2 p-1 shrink-0 text-muted-foreground hover:text-secondary-foreground transition-colors"
        aria-label="Copy command"
      >
        {copied ? (
          <CheckIcon className="h-4 w-4 text-primary" />
        ) : (
          <ClipboardIcon className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}

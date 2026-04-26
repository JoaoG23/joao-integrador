import * as React from "react";
import { cn } from "@/lib/utils";

export interface SqlTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const SQL_KEYWORDS = [
  "SELECT",
  "FROM",
  "WHERE",
  "INSERT",
  "INTO",
  "VALUES",
  "UPDATE",
  "SET",
  "DELETE",
  "CREATE",
  "TABLE",
  "DROP",
  "ALTER",
  "INNER",
  "JOIN",
  "LEFT",
  "RIGHT",
  "OUTER",
  "ON",
  "GROUP",
  "BY",
  "ORDER",
  "HAVING",
  "LIMIT",
  "UNION",
  "ALL",
  "AS",
  "AND",
  "OR",
  "NOT",
  "NULL",
  "IS",
  "EXISTS",
  "BETWEEN",
  "LIKE",
  "IN",
  "CASE",
  "WHEN",
  "THEN",
  "ELSE",
  "END",
  "CAST",
  "DESC",
  "ASC",
];

export function highlightSql(text: string) {
  if (!text) return null;

  // Regex capturing SQL keywords, parameters, strings, and numbers
  const regex = new RegExp(
    `(\\b(?:${SQL_KEYWORDS.join("|")})\\b|:[a-zA-Z0-9_]+|'[^']*'|\\b\\d+\\b)`,
    "gi",
  );
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, i) => {
        if (!part) return null;

        const upperPart = part.toUpperCase();

        // Keywords in #46CF69
        if (SQL_KEYWORDS.includes(upperPart)) {
          return (
            <span key={i} className="text-[#46CF69] font-bold">
              {part}
            </span>
          );
        }

        // Parameters and Numbers in Sky blue
        if (part.startsWith(":") || /^\d+$/.test(part)) {
          return (
            <span key={i} className="text-sky-400 font-bold">
              {part}
            </span>
          );
        }

        // Strings in Amber
        if (part.startsWith("'")) {
          return (
            <span key={i} className="text-amber-300 font-medium">
              {part}
            </span>
          );
        }

        // Default text in Purple (replaces gray/slate-300)
        return (
          <span key={i} className="text-purple-300 font-medium">
            {part}
          </span>
        );
      })}
    </>
  );
}

export const SqlTextarea = React.forwardRef<
  HTMLTextAreaElement,
  SqlTextareaProps
>(({ className, value, onChange, ...props }, ref) => {
  const textAreaRef = React.useRef<HTMLTextAreaElement>(null);
  const backdropRef = React.useRef<HTMLDivElement>(null);

  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (!backdropRef.current) return;
    backdropRef.current.scrollTop = e.currentTarget.scrollTop;
    backdropRef.current.scrollLeft = e.currentTarget.scrollLeft;
  };

  const combinedRef = (node: HTMLTextAreaElement) => {
    textAreaRef.current = node;
    if (typeof ref === "function") {
      ref(node);
      return;
    }
    if (ref) {
      ref.current = node;
    }
  };

  const textValue = (value ?? "") as string;

  return (
    <div
      className={cn(
        "relative w-full block bg-[#232533] rounded-md",
        className,
      )}
    >
      {/* Backdrop for syntax highlighting */}
      <div
        ref={backdropRef}
        className="absolute inset-0 px-3 py-2 bg-transparent pointer-events-none break-words whitespace-pre-wrap overflow-hidden rounded-md border border-transparent"
      >
        {highlightSql(textValue + (textValue.endsWith("\n") ? " " : ""))}
      </div>

      {/* Transparent Textarea overlay */}
      <textarea
        ref={combinedRef}
        value={value}
        onChange={onChange}
        onScroll={handleScroll}
        className={cn(
          "flex w-full min-h-[350px] rounded-md border border-slate-700 px-3 py-2 shadow-sm placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-500 disabled:cursor-not-allowed disabled:opacity-50",
          "text-transparent bg-transparent caret-white resize-y",
        )}
        spellCheck={false}
        {...props}
      />

      {/* Resize indicator icon */}
      <div className="absolute bottom-1 right-1 pointer-events-none text-slate-600 opacity-50">
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m15 19 4-4" />
          <path d="m11 19 8-8" />
        </svg>
      </div>
    </div>
  );
});
SqlTextarea.displayName = "SqlTextarea";

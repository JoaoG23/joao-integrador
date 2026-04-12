import * as React from "react";
import { cn } from "@/lib/utils";

export interface SqlTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const SQL_KEYWORDS = [
  "SELECT", "FROM", "WHERE", "INSERT", "INTO", "VALUES", "UPDATE", "SET", 
  "DELETE", "CREATE", "TABLE", "DROP", "ALTER", "INNER", "JOIN", "LEFT", 
  "RIGHT", "OUTER", "ON", "GROUP", "BY", "ORDER", "HAVING", "LIMIT", 
  "UNION", "ALL", "AS", "AND", "OR", "NOT", "NULL", "IS", "EXISTS", "BETWEEN", "LIKE", "IN",
  "CASE", "WHEN", "THEN", "ELSE", "END", "CAST", "DESC", "ASC"
];

export function highlightSql(text: string) {
  if (!text) return null;
  // Regex capturing SQL keywords OR parameters starting with :
  const regex = new RegExp(`(\\b(?:${SQL_KEYWORDS.join('|')})\\b|:[a-zA-Z0-9_]+)`, 'gi');
  const parts = text.split(regex);
  
  return (
    <>
      {parts.map((part, i) => {
        if (!part) return null;
        
        const upperPart = part.toUpperCase();
        if (SQL_KEYWORDS.includes(upperPart)) {
          return <span key={i} className="text-red-600 font-bold">{part}</span>;
        }
        
        if (part.startsWith(':')) {
          return <span key={i} className="text-green-600 font-bold">{part}</span>;
        }
        
        return <span key={i} className="text-blue-900 dark:text-blue-300 font-medium">{part}</span>;
      })}
    </>
  );
}

export const SqlTextarea = React.forwardRef<HTMLTextAreaElement, SqlTextareaProps>(
  ({ className, value, onChange, ...props }, ref) => {
    const textAreaRef = React.useRef<HTMLTextAreaElement>(null);
    const backdropRef = React.useRef<HTMLDivElement>(null);

    const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
      if (backdropRef.current) {
        backdropRef.current.scrollTop = e.currentTarget.scrollTop;
        backdropRef.current.scrollLeft = e.currentTarget.scrollLeft;
      }
    };

    const combinedRef = (node: HTMLTextAreaElement) => {
      textAreaRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) ref.current = node;
    };

    const textValue = (value ?? "") as string;

    return (
      <div className={cn("relative w-full block", className)}>
        {/* Backdrop for syntax highlighting */}
        <div 
          ref={backdropRef}
          className="absolute inset-0 px-3 py-2 bg-transparent pointer-events-none break-words whitespace-pre-wrap overflow-hidden rounded-md border border-transparent"
        >
          {highlightSql(textValue + (textValue.endsWith('\n') ? ' ' : ''))}
        </div>
        
        {/* Transparent Textarea overlay */}
        <textarea
          ref={combinedRef}
          value={value}
          onChange={onChange}
          onScroll={handleScroll}
          className={cn(
            "flex w-full h-full min-h-[60px] rounded-md border border-input px-3 py-2 shadow-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
            "text-transparent bg-transparent caret-black dark:caret-white resize-none"
          )}
          spellCheck={false}
          {...props}
        />
      </div>
    );
  }
);
SqlTextarea.displayName = "SqlTextarea";

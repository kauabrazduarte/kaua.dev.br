import * as React from "react";

/**
 * Replace {name} placeholders in a translation template with React nodes.
 *
 * `t.rich` from next-intl serializes its callback through the RSC boundary
 * which can fail with "Functions cannot be passed directly to Client
 * Components". This helper works on the raw string and returns a plain
 * ReactNode array — safe in any component, server or client.
 */
export function interpolate(
  template: string,
  values: Record<string, React.ReactNode>,
): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const regex = /\{(\w+)\}/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = regex.exec(template)) !== null) {
    if (match.index > lastIndex) {
      parts.push(template.slice(lastIndex, match.index));
    }
    const value = values[match[1]];
    parts.push(
      <React.Fragment key={key++}>
        {value ?? match[0]}
      </React.Fragment>,
    );
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < template.length) {
    parts.push(template.slice(lastIndex));
  }
  return parts;
}

declare module "@11ty/eleventy-fetch" {
  export interface EleventyFetchOptions {
    duration?: string | number;
    type?: "buffer" | "json" | "text" | "xml" | "parsed-xml";
    directory?: string;
    dryRun?: boolean;
    fetchOptions?: RequestInit;
    [key: string]: any;
  }

  export default function EleventyFetch<T = any>(
    input: string | (() => T | Promise<T>),
    options?: EleventyFetchOptions,
  ): Promise<T>;
}

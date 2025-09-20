import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";
import { visit } from "unist-util-visit"; // <-- 1. Importar o 'visit'
import type { Node } from "unist";

// Tipos básicos para o plugin (pode ajustar se tiver tipos mais específicos)
interface ElementNode extends Node {
  type: "element";
  tagName: string;
  properties: { [key: string]: unknown };
  children: Node[];
}

// <-- 2. Nosso plugin customizado para reescrever o caminho da imagem
function rehypeRewriteImagePath(options: { baseUrl: string }) {
  return (tree: Node) => {
    visit(tree, "element", (node: ElementNode) => {
      // Verifica se é uma tag <img> e se tem um atributo 'src'
      if (node.tagName === "img" && node.properties && node.properties.src) {
        const src = node.properties.src as string;

        // Verifica se o caminho é relativo (não começa com http, https ou //)
        if (
          !src.startsWith("http://") &&
          !src.startsWith("https://") &&
          !src.startsWith("//")
        ) {
          // Garante que a URL base termine com /
          const baseUrl = options.baseUrl.endsWith("/")
            ? options.baseUrl
            : options.baseUrl + "/";
          // Garante que o src não comece com / para evitar barras duplas
          const imagePath = src.startsWith("/") ? src.slice(1) : src;

          node.properties.src = baseUrl + imagePath;
        }
      }
    });
  };
}

export async function markdownToHtml(
  repo: string | undefined,
  markdown: string,
): Promise<string> {
  const GITHUB_RAW_BASE_URL = `https://raw.githubusercontent.com/kauabrazduarte/${repo}/refs/heads/main/`;

  const schema = {
    // ... (o mesmo schema da resposta anterior, mantido para completude)
    ...defaultSchema,
    tagNames: [
      ...(defaultSchema.tagNames ?? []),
      "table",
      "thead",
      "tbody",
      "tr",
      "th",
      "td",
      "input",
    ],
    attributes: {
      ...defaultSchema.attributes,
      "*": [...(defaultSchema.attributes?.["*"] ?? []), "className", "id"],
      a: [
        ...(defaultSchema.attributes?.a ?? []),
        "href",
        "title",
        "target",
        "rel",
      ],
      img: [
        ...(defaultSchema.attributes?.img ?? []),
        "src",
        "alt",
        "title",
        "width",
        "height",
        "style",
        "loading",
        "decoding",
      ],
      p: [...(defaultSchema.attributes?.p ?? []), "align"],
      div: [...(defaultSchema.attributes?.div ?? []), "align"],
      th: [...(defaultSchema.attributes?.th ?? []), "align"],
      td: [...(defaultSchema.attributes?.td ?? []), "align"],
      input: [
        ...(defaultSchema.attributes?.input ?? []),
        "type",
        "checked",
        "disabled",
      ],
    },
    protocols: {
      ...defaultSchema.protocols,
      href: ["http", "https", "mailto"],
      src: ["http", "https", "data"],
    },
  };

  const processed = await remark()
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    // <-- 3. Adicionar nosso plugin aqui
    .use(rehypeRewriteImagePath, {
      baseUrl: repo ? GITHUB_RAW_BASE_URL : "",
    })
    .use(rehypeSanitize, schema)
    .use(rehypeStringify)
    .process(markdown);

  return String(processed);
}

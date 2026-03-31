import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Link from "next/link";

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h2: ({ children, ...props }) => {
          const text = String(children);
          const id = text
            .toLowerCase()
            .replace(/[^a-z0-9가-힣]/g, "-")
            .replace(/-+/g, "-")
            .replace(/^-|-$/g, "");
          return (
            <h2 id={id} {...props}>
              {children}
            </h2>
          );
        },
        a: ({ href, children, ...props }) => {
          if (href?.startsWith("/")) {
            return <Link href={href}>{children}</Link>;
          }
          return (
            <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
              {children}
            </a>
          );
        },
        table: ({ children, ...props }) => (
          <div className="overflow-x-auto">
            <table {...props}>{children}</table>
          </div>
        ),
      }}
    />
  );
}

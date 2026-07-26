import { Fragment } from "react";
import Link from "next/link";

/**
 * Renders a Tiptap document to React elements.
 *
 * Deliberately renders to elements rather than an HTML string — React escapes
 * text content, so post bodies cannot inject markup even though the JSON is
 * user-supplied. No `dangerouslySetInnerHTML` anywhere in this path.
 *
 * Hand-rolled rather than pulling in `@tiptap/html` and the ProseMirror
 * runtime, which would ship a schema to the server for a read-only concern.
 */

type Mark = { type: string; attrs?: Record<string, any> };
type Node = {
    type: string;
    text?: string;
    attrs?: Record<string, any>;
    marks?: Mark[];
    content?: Node[];
};

const applyMarks = (text: string, marks: Mark[] = [], key: string) => {
    let element: React.ReactNode = text;

    for (const mark of marks) {
        switch (mark.type) {
            case "bold":
                element = <strong>{element}</strong>;
                break;
            case "italic":
                element = <em>{element}</em>;
                break;
            case "strike":
                element = <s>{element}</s>;
                break;
            case "code":
                element = (
                    <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.9em]">
                        {element}
                    </code>
                );
                break;
            case "link": {
                const href = String(mark.attrs?.href ?? "");
                // Only permit schemes that can't execute script.
                const safe = /^(https?:|mailto:|\/)/i.test(href);
                element = safe ? (
                    <Link
                        href={href}
                        target={href.startsWith("/") ? undefined : "_blank"}
                        rel="noopener noreferrer"
                    >
                        {element}
                    </Link>
                ) : (
                    element
                );
                break;
            }
        }
    }

    return <Fragment key={key}>{element}</Fragment>;
};

const renderNodes = (nodes: Node[] = [], prefix = ""): React.ReactNode =>
    nodes.map((node, index) => renderNode(node, `${prefix}-${index}`));

const renderNode = (node: Node, key: string): React.ReactNode => {
    switch (node.type) {
        case "text":
            return applyMarks(node.text ?? "", node.marks, key);

        case "paragraph":
            return <p key={key}>{renderNodes(node.content, key)}</p>;

        case "heading": {
            const level = Math.min(Math.max(Number(node.attrs?.level ?? 2), 2), 4);
            const Tag = `h${level}` as "h2" | "h3" | "h4";
            return <Tag key={key}>{renderNodes(node.content, key)}</Tag>;
        }

        case "bulletList":
            return <ul key={key}>{renderNodes(node.content, key)}</ul>;

        case "orderedList":
            return <ol key={key}>{renderNodes(node.content, key)}</ol>;

        case "listItem":
            return <li key={key}>{renderNodes(node.content, key)}</li>;

        case "blockquote":
            return <blockquote key={key}>{renderNodes(node.content, key)}</blockquote>;

        case "codeBlock": {
            const language = node.attrs?.language;
            return (
                <pre key={key} data-language={language}>
                    <code>{node.content?.map((c) => c.text).join("")}</code>
                </pre>
            );
        }

        case "horizontalRule":
            return <hr key={key} className="border-rule" />;

        case "hardBreak":
            return <br key={key} />;

        default:
            // Unknown node types render their children rather than vanishing.
            return node.content ? (
                <Fragment key={key}>{renderNodes(node.content, key)}</Fragment>
            ) : null;
    }
};

type TiptapRendererProps = {
    /** Tiptap JSON. Falls back to plain text when absent. */
    content: unknown;
    fallback?: string;
};

const TiptapRenderer = ({ content, fallback }: TiptapRendererProps) => {
    const doc = content as Node | null;

    if (!doc || doc.type !== "doc" || !doc.content?.length) {
        // Legacy plain-text posts, split on blank lines.
        return (
            <>
                {(fallback ?? "")
                    .split(/\n{2,}/)
                    .filter(Boolean)
                    .map((para, i) => (
                        <p key={i}>{para}</p>
                    ))}
            </>
        );
    }

    return <>{renderNodes(doc.content, "n")}</>;
};

export default TiptapRenderer;

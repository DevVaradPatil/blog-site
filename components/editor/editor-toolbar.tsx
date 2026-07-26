"use client";

import { useCallback, useRef } from "react";
import type { Editor } from "@tiptap/react";
import {
    Bold, Italic, Strikethrough, Code, Heading2, Heading3,
    List, ListOrdered, Quote, Link2, ImageIcon, Minus,
    Undo2, Redo2, Code2,
} from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { uploadFile } from "@/lib/upload-client";

type ToolButtonProps = {
    onClick: () => void;
    active?: boolean;
    disabled?: boolean;
    label: string;
    children: React.ReactNode;
};

const ToolButton = ({ onClick, active, disabled, label, children }: ToolButtonProps) => (
    <button
        type="button"
        // Keeps focus in the document so the command applies to the selection.
        onMouseDown={(e) => e.preventDefault()}
        onClick={onClick}
        disabled={disabled}
        aria-label={label}
        aria-pressed={active}
        title={label}
        className={cn(
            "inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors",
            "disabled:opacity-40 disabled:cursor-not-allowed",
            active
                ? "bg-signal/12 text-signal"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
        )}
    >
        {children}
    </button>
);

const Divider = () => <div className="mx-1 h-5 w-px bg-border" aria-hidden />;

const EditorToolbar = ({ editor }: { editor: Editor | null }) => {
    const fileRef = useRef<HTMLInputElement>(null);

    const addLink = useCallback(() => {
        if (!editor) return;

        const previous = editor.getAttributes("link").href as string | undefined;
        const url = window.prompt("Link URL", previous ?? "https://");

        if (url === null) return;

        if (url === "") {
            editor.chain().focus().extendMarkRange("link").unsetLink().run();
            return;
        }

        if (!/^(https?:\/\/|mailto:|\/)/i.test(url)) {
            toast.error("Links must start with http://, https:// or /");
            return;
        }

        editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    }, [editor]);

    const insertImage = useCallback(
        async (file: File) => {
            if (!editor) return;

            const pending = toast.loading("Uploading image…");
            const result = await uploadFile(file, "posts");
            toast.dismiss(pending);

            if (!result.ok) {
                toast.error(result.error);
                return;
            }

            editor.chain().focus().setImage({ src: result.image.url }).run();
        },
        [editor],
    );

    if (!editor) return null;

    return (
        <div className="sticky top-16 z-20 flex flex-wrap items-center gap-0.5 rounded-t-xl border border-b-0 border-border bg-card/95 px-2 py-1.5 backdrop-blur">
            <ToolButton
                label="Bold"
                active={editor.isActive("bold")}
                onClick={() => editor.chain().focus().toggleBold().run()}
            >
                <Bold className="h-4 w-4" />
            </ToolButton>
            <ToolButton
                label="Italic"
                active={editor.isActive("italic")}
                onClick={() => editor.chain().focus().toggleItalic().run()}
            >
                <Italic className="h-4 w-4" />
            </ToolButton>
            <ToolButton
                label="Strikethrough"
                active={editor.isActive("strike")}
                onClick={() => editor.chain().focus().toggleStrike().run()}
            >
                <Strikethrough className="h-4 w-4" />
            </ToolButton>
            <ToolButton
                label="Inline code"
                active={editor.isActive("code")}
                onClick={() => editor.chain().focus().toggleCode().run()}
            >
                <Code className="h-4 w-4" />
            </ToolButton>

            <Divider />

            <ToolButton
                label="Heading"
                active={editor.isActive("heading", { level: 2 })}
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            >
                <Heading2 className="h-4 w-4" />
            </ToolButton>
            <ToolButton
                label="Subheading"
                active={editor.isActive("heading", { level: 3 })}
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            >
                <Heading3 className="h-4 w-4" />
            </ToolButton>

            <Divider />

            <ToolButton
                label="Bulleted list"
                active={editor.isActive("bulletList")}
                onClick={() => editor.chain().focus().toggleBulletList().run()}
            >
                <List className="h-4 w-4" />
            </ToolButton>
            <ToolButton
                label="Numbered list"
                active={editor.isActive("orderedList")}
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
            >
                <ListOrdered className="h-4 w-4" />
            </ToolButton>
            <ToolButton
                label="Quote"
                active={editor.isActive("blockquote")}
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
            >
                <Quote className="h-4 w-4" />
            </ToolButton>
            <ToolButton
                label="Code block"
                active={editor.isActive("codeBlock")}
                onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            >
                <Code2 className="h-4 w-4" />
            </ToolButton>

            <Divider />

            <ToolButton label="Link" active={editor.isActive("link")} onClick={addLink}>
                <Link2 className="h-4 w-4" />
            </ToolButton>
            <ToolButton label="Insert image" onClick={() => fileRef.current?.click()}>
                <ImageIcon className="h-4 w-4" />
            </ToolButton>
            <ToolButton
                label="Divider"
                onClick={() => editor.chain().focus().setHorizontalRule().run()}
            >
                <Minus className="h-4 w-4" />
            </ToolButton>

            <Divider />

            <ToolButton
                label="Undo"
                disabled={!editor.can().undo()}
                onClick={() => editor.chain().focus().undo().run()}
            >
                <Undo2 className="h-4 w-4" />
            </ToolButton>
            <ToolButton
                label="Redo"
                disabled={!editor.can().redo()}
                onClick={() => editor.chain().focus().redo().run()}
            >
                <Redo2 className="h-4 w-4" />
            </ToolButton>

            <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) insertImage(file);
                    e.target.value = "";
                }}
            />
        </div>
    );
};

export default EditorToolbar;

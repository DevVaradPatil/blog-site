"use client";

import {
    useEditor,
    EditorContent,
    type Editor,
    type JSONContent,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { Placeholder } from "@tiptap/extensions";
import { useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";

import EditorToolbar from "./editor-toolbar";
import { uploadFile } from "@/lib/upload-client";

type RichEditorProps = {
    initialContent?: JSONContent | null;
    onChange: (json: JSONContent) => void;
    placeholder?: string;
};

const RichEditor = ({ initialContent, onChange, placeholder }: RichEditorProps) => {
    // The paste/drop handlers are defined inside the editor's own config, so
    // they can't reference the editor binding directly. A ref bridges that.
    const editorRef = useRef<Editor | null>(null);

    const handleDroppedImage = useCallback(async (file: File) => {
        const pending = toast.loading("Uploading image…");
        const result = await uploadFile(file, "posts");
        toast.dismiss(pending);

        if (!result.ok) {
            toast.error(result.error);
            return;
        }

        editorRef.current?.chain().focus().setImage({ src: result.image.url }).run();
    }, []);

    const editor = useEditor({
        // Tiptap renders differently on server and client; deferring the first
        // render avoids a hydration mismatch in the App Router.
        immediatelyRender: false,
        extensions: [
            StarterKit.configure({
                heading: { levels: [2, 3] },
                // StarterKit v3 bundles Link — configure it here rather than
                // adding the standalone extension, which would duplicate it.
                link: {
                    openOnClick: false,
                    autolink: true,
                    protocols: ["http", "https", "mailto"],
                    HTMLAttributes: { rel: "noopener noreferrer" },
                },
            }),
            Image.configure({
                HTMLAttributes: { class: "rounded-lg border border-border" },
            }),
            Placeholder.configure({
                placeholder: placeholder ?? "Start with what you set out to build…",
            }),
        ],
        content: initialContent ?? undefined,
        editorProps: {
            attributes: {
                // The wrapper shows the focus state, so the editable surface
                // itself takes no ring of its own.
                class:
                    "prose-editorial min-h-[420px] max-w-none px-5 py-6 focus:outline-none focus-visible:ring-0",
            },
            handlePaste(_view, event) {
                const file = Array.from(event.clipboardData?.files ?? [])[0];
                if (file?.type.startsWith("image/")) {
                    event.preventDefault();
                    handleDroppedImage(file);
                    return true;
                }
                return false;
            },
            handleDrop(_view, event) {
                const file = Array.from(
                    (event as DragEvent).dataTransfer?.files ?? [],
                )[0];
                if (file?.type.startsWith("image/")) {
                    event.preventDefault();
                    handleDroppedImage(file);
                    return true;
                }
                return false;
            },
        },
        onUpdate: ({ editor }) => onChange(editor.getJSON()),
    });

    useEffect(() => {
        editorRef.current = editor;
    }, [editor]);

    return (
        <div className="form-field rounded-xl border border-border bg-card transition-[border-color,box-shadow] duration-150">
            <EditorToolbar editor={editor} />
            <EditorContent editor={editor} />
        </div>
    );
};

export default RichEditor;

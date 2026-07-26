"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import type { JSONContent } from "@tiptap/react";
import { toast } from "sonner";
import { ImagePlus, Loader2, Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { savePost } from "@/actions/save-post";
import { uploadFile } from "@/lib/upload-client";
import { slugifyTag } from "@/lib/post-utils";
import { cn } from "@/lib/utils";

// The editor pulls in ProseMirror; keep it out of the initial page bundle.
const RichEditor = dynamic(() => import("./rich-editor"), {
    ssr: false,
    loading: () => (
        <div className="flex min-h-[420px] items-center justify-center rounded-xl border border-border bg-card">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
    ),
});

const AUTOSAVE_DELAY = 2500;

export type PostEditorInitial = {
    id?: string;
    title: string;
    contentJson: JSONContent | null;
    coverImage: string | null;
    coverImageId: string | null;
    tags: string[];
    link: string;
    status: "DRAFT" | "PUBLISHED";
};

const EMPTY: PostEditorInitial = {
    title: "",
    contentJson: null,
    coverImage: null,
    coverImageId: null,
    tags: [],
    link: "",
    status: "DRAFT",
};

type SaveState = "idle" | "saving" | "saved" | "error";

const PostEditor = ({ initial = EMPTY }: { initial?: PostEditorInitial }) => {
    const router = useRouter();

    const [postId, setPostId] = useState(initial.id);
    const [title, setTitle] = useState(initial.title);
    const [content, setContent] = useState<JSONContent | null>(initial.contentJson);
    const [coverImage, setCoverImage] = useState(initial.coverImage);
    const [coverImageId, setCoverImageId] = useState(initial.coverImageId);
    const [tags, setTags] = useState<string[]>(initial.tags);
    const [tagDraft, setTagDraft] = useState("");
    const [link, setLink] = useState(initial.link);
    const [status, setStatus] = useState(initial.status);

    const [saveState, setSaveState] = useState<SaveState>("idle");
    const [publishing, setPublishing] = useState(false);
    const [uploadingCover, setUploadingCover] = useState(false);

    const coverInputRef = useRef<HTMLInputElement>(null);
    const dirtyRef = useRef(false);
    const timerRef = useRef<ReturnType<typeof setTimeout>>();

    const persist = useCallback(
        async (nextStatus: "DRAFT" | "PUBLISHED") => {
            if (!title.trim()) {
                return { error: "Give it a title" } as const;
            }

            const result = await savePost({
                id: postId,
                title: title.trim(),
                contentJson: content ?? { type: "doc", content: [] },
                coverImage,
                coverImageId,
                tags,
                link,
                status: nextStatus,
            });

            if (!result.error && result.id) {
                setPostId(result.id);
                if (result.status) setStatus(result.status as "DRAFT" | "PUBLISHED");
            }

            return result;
        },
        [postId, title, content, coverImage, coverImageId, tags, link],
    );

    /** Debounced background save. Only drafts autosave — see note below. */
    useEffect(() => {
        if (!dirtyRef.current) return;
        // Published posts are never saved behind the author's back; an edit to
        // live content has to be an explicit action.
        if (status === "PUBLISHED") return;
        if (!title.trim()) return;

        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(async () => {
            setSaveState("saving");
            const result = await persist("DRAFT");
            setSaveState(result.error ? "error" : "saved");
        }, AUTOSAVE_DELAY);

        return () => clearTimeout(timerRef.current);
    }, [title, content, coverImage, tags, link, status, persist]);

    /** Warn before losing unsaved edits. */
    useEffect(() => {
        const handler = (event: BeforeUnloadEvent) => {
            if (dirtyRef.current && saveState !== "saved") {
                event.preventDefault();
                event.returnValue = "";
            }
        };
        window.addEventListener("beforeunload", handler);
        return () => window.removeEventListener("beforeunload", handler);
    }, [saveState]);

    const markDirty = () => {
        dirtyRef.current = true;
        setSaveState("idle");
    };

    const handleCover = async (file: File) => {
        setUploadingCover(true);
        const result = await uploadFile(file, "posts");
        setUploadingCover(false);

        if (!result.ok) {
            toast.error(result.error);
            return;
        }

        setCoverImage(result.image.url);
        setCoverImageId(result.image.publicId);
        markDirty();
    };

    const addTag = (raw: string) => {
        const value = raw.trim().replace(/,$/, "");
        if (!value) return;
        if (tags.length >= 6) {
            toast.error("Six tags maximum");
            return;
        }
        if (tags.some((t) => slugifyTag(t) === slugifyTag(value))) {
            setTagDraft("");
            return;
        }
        setTags([...tags, value]);
        setTagDraft("");
        markDirty();
    };

    const handleSaveDraft = async () => {
        setSaveState("saving");
        const result = await persist("DRAFT");

        if (result.error) {
            setSaveState("error");
            toast.error(result.error);
            return;
        }

        dirtyRef.current = false;
        setSaveState("saved");
        toast.success("Draft saved");
    };

    const handlePublish = async () => {
        setPublishing(true);
        const result = await persist("PUBLISHED");
        setPublishing(false);

        if (result.error) {
            toast.error(result.error);
            return;
        }

        dirtyRef.current = false;
        setSaveState("saved");
        toast.success(status === "PUBLISHED" ? "Changes published" : "Published");

        const slug = "slug" in result ? result.slug : undefined;
        if (slug) router.push(`/post/${slug}`);
    };

    const saveLabel = {
        idle: postId ? "Unsaved changes" : "Not saved yet",
        saving: "Saving…",
        saved: "Saved",
        error: "Couldn't save",
    }[saveState];

    return (
        <div className="space-y-6">
            {/* Status bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3">
                <div className="flex items-center gap-2.5">
                    <span
                        className={cn(
                            "inline-flex h-2 w-2 rounded-full",
                            status === "PUBLISHED" ? "bg-emerald-500" : "bg-amber-500",
                        )}
                        aria-hidden
                    />
                    <span className="label">
                        {status === "PUBLISHED" ? "Published" : "Draft"}
                    </span>
                    <span className="text-muted-foreground" aria-hidden>·</span>
                    <span
                        className={cn(
                            "text-xs",
                            saveState === "error" ? "text-destructive" : "text-muted-foreground",
                        )}
                        role="status"
                        aria-live="polite"
                    >
                        {saveLabel}
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleSaveDraft}
                        disabled={saveState === "saving" || publishing}
                    >
                        {status === "PUBLISHED" ? "Revert to draft" : "Save draft"}
                    </Button>
                    <Button
                        type="button"
                        size="sm"
                        onClick={handlePublish}
                        disabled={publishing || !title.trim()}
                    >
                        {publishing && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
                        {status === "PUBLISHED" ? "Publish changes" : "Publish"}
                    </Button>
                </div>
            </div>

            {/* Cover */}
            <div>
                <label className="label mb-2 block">Cover image</label>
                {coverImage ? (
                    <div className="group relative overflow-hidden rounded-xl border border-border">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={coverImage}
                            alt="Cover preview"
                            className="aspect-[2/1] w-full object-cover"
                        />
                        <button
                            type="button"
                            onClick={() => {
                                setCoverImage(null);
                                setCoverImageId(null);
                                markDirty();
                            }}
                            aria-label="Remove cover image"
                            className="absolute right-3 top-3 rounded-md bg-background/90 p-1.5 text-muted-foreground backdrop-blur transition-colors hover:text-destructive"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                ) : (
                    <button
                        type="button"
                        onClick={() => coverInputRef.current?.click()}
                        disabled={uploadingCover}
                        className="flex aspect-[3/1] w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-card/50 text-muted-foreground transition-colors hover:border-signal/50 hover:text-foreground"
                    >
                        {uploadingCover ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <>
                                <ImagePlus className="h-5 w-5" />
                                <span className="text-sm">Add a cover image</span>
                                <span className="text-2xs">
                                    Optional — a generated cover is used otherwise
                                </span>
                            </>
                        )}
                    </button>
                )}
                <input
                    ref={coverInputRef}
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleCover(file);
                        e.target.value = "";
                    }}
                />
            </div>

            {/* Title */}
            <div>
                <label htmlFor="post-title" className="label mb-2 block">
                    Title
                </label>
                <input
                    id="post-title"
                    value={title}
                    onChange={(e) => {
                        setTitle(e.target.value);
                        markDirty();
                    }}
                    placeholder="What did you build?"
                    // Borderless field: the caret is the focus affordance, so a
                    // ring here would just box in the headline.
                    className="w-full bg-transparent font-display text-3xl font-bold leading-tight outline-none focus-visible:ring-0 placeholder:text-muted-foreground/40 lg:text-4xl"
                />
            </div>

            {/* Body */}
            <div>
                <label className="label mb-2 block">Write-up</label>
                <RichEditor
                    initialContent={initial.contentJson}
                    onChange={(json) => {
                        setContent(json);
                        markDirty();
                    }}
                />
            </div>

            {/* Tags */}
            <div>
                <label htmlFor="post-tags" className="label mb-2 block">
                    Tags <span className="normal-case">({tags.length}/6)</span>
                </label>
                {/* The container carries the focus state, matching Input. */}
                <div className="form-field flex flex-wrap gap-2 rounded-xl border border-border bg-card p-2.5 transition-[border-color,box-shadow] duration-150">
                    {tags.map((tag) => (
                        <span
                            key={tag}
                            className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-sm"
                        >
                            {tag}
                            <button
                                type="button"
                                aria-label={`Remove tag ${tag}`}
                                onClick={() => {
                                    setTags(tags.filter((t) => t !== tag));
                                    markDirty();
                                }}
                                className="text-muted-foreground transition-colors hover:text-destructive"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </span>
                    ))}
                    <input
                        id="post-tags"
                        value={tagDraft}
                        onChange={(e) => setTagDraft(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === ",") {
                                e.preventDefault();
                                addTag(tagDraft);
                            } else if (e.key === "Backspace" && !tagDraft && tags.length) {
                                setTags(tags.slice(0, -1));
                                markDirty();
                            }
                        }}
                        onBlur={() => addTag(tagDraft)}
                        placeholder={tags.length ? "" : "arduino, computer vision…"}
                        className="min-w-[12ch] flex-1 bg-transparent px-1 text-sm outline-none focus-visible:ring-0 placeholder:text-muted-foreground/50"
                    />
                </div>
            </div>

            {/* Live link */}
            <div>
                <label htmlFor="post-link" className="label mb-2 block">
                    Live project link
                </label>
                <Input
                    id="post-link"
                    value={link}
                    onChange={(e) => {
                        setLink(e.target.value);
                        markDirty();
                    }}
                    placeholder="https://your-project.vercel.app"
                    type="url"
                />
            </div>
        </div>
    );
};

export default PostEditor;

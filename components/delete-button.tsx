"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deletePost } from "@/actions/post-actions";

type DeleteButtonProps = {
  id: string;
  title: string;
};

const DeleteButton = ({ id, title }: DeleteButtonProps) => {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const handleDeleteClick = async () => {
    setPending(true);
    const result = await deletePost(id);
    setPending(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success(result.success);
    router.refresh();
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger
        aria-label={`Delete "${title}"`}
        className="rounded-md border border-border bg-background/80 p-1.5 text-muted-foreground backdrop-blur transition-colors hover:border-destructive hover:text-destructive"
      >
        <Trash2 className="h-4 w-4" />
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this write-up?</AlertDialogTitle>
          <AlertDialogDescription>
            &ldquo;{title}&rdquo; will be removed, along with its comments and
            upvotes. This can&apos;t be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep it</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDeleteClick}
            disabled={pending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {pending ? "Deleting…" : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteButton;

"use client";

import { useOptimistic, useRef, useTransition } from "react";
import { Button } from "@papupapu/ui";
import { createComment } from "./actions";

interface Props {
  postSlug: string;
  userId?: string;
}

export function CommentForm({ postSlug, userId }: Props) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [isPending, startTransition] = useTransition();

  if (!userId) {
    return (
      <p className="text-sm text-gray-mid">
        <a href="/login" className="text-gray-dark underline underline-offset-2">Sign in</a> to leave a comment.
      </p>
    );
  }

  function handleSubmit(formData: FormData) {
    const content = formData.get("content") as string;
    if (!content?.trim()) return;

    startTransition(async () => {
      await createComment(postSlug, content);
      if (ref.current) ref.current.value = "";
    });
  }

  return (
    <form action={handleSubmit} className="space-y-3">
      <textarea
        ref={ref}
        name="content"
        rows={3}
        placeholder="Write a comment..."
        maxLength={1000}
        required
        className="w-full rounded-md border border-gray-light px-3 py-2 text-sm text-gray-dark placeholder:text-gray-mid focus:outline-none focus:ring-2 focus:ring-gray-dark resize-none"
      />
      <Button type="submit" size="sm" loading={isPending}>
        {isPending ? "Posting…" : "Post comment"}
      </Button>
    </form>
  );
}

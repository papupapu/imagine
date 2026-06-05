"use server";

import { revalidateTag } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { comment } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function createComment(postSlug: string, content: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const trimmed = content.trim();
  if (!trimmed || trimmed.length > 1000) return { error: "Invalid comment" };

  await db.insert(comment).values({
    postSlug,
    userId: session.user.id,
    content: trimmed,
  });

  revalidateTag(`comments:${postSlug}`, "page");
}

export async function deleteComment(commentId: number, postSlug: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  await db
    .delete(comment)
    .where(and(eq(comment.id, commentId), eq(comment.userId, session.user.id)));

  revalidateTag(`comments:${postSlug}`, "page");
}

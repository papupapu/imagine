"use server";

import { revalidateTag } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { like, bookmark } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function toggleLike(postSlug: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const existing = await db.query.like.findFirst({
    where: and(eq(like.postSlug, postSlug), eq(like.userId, session.user.id)),
  });

  if (existing) {
    await db.delete(like).where(eq(like.id, existing.id));
  } else {
    await db.insert(like).values({ postSlug, userId: session.user.id });
  }

  revalidateTag(`reactions:${postSlug}`, "page");
}

export async function toggleBookmark(postSlug: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const existing = await db.query.bookmark.findFirst({
    where: and(eq(bookmark.postSlug, postSlug), eq(bookmark.userId, session.user.id)),
  });

  if (existing) {
    await db.delete(bookmark).where(eq(bookmark.id, existing.id));
  } else {
    await db.insert(bookmark).values({ postSlug, userId: session.user.id });
  }

  revalidateTag(`reactions:${postSlug}`, "page");
}

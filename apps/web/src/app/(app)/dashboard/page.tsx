import { headers } from "next/headers";
import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { comment, like, bookmark } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;

  const { user } = session;

  const [recentComments, recentLikes, recentBookmarks] = await Promise.all([
    db.select().from(comment).where(eq(comment.userId, user.id)).orderBy(desc(comment.createdAt)).limit(5),
    db.select().from(like).where(eq(like.userId, user.id)).orderBy(desc(like.createdAt)).limit(5),
    db.select().from(bookmark).where(eq(bookmark.userId, user.id)).orderBy(desc(bookmark.createdAt)).limit(5),
  ]);

  return (
    <div className="max-w-3xl mx-auto px-6 py-16 space-y-12">
      <div>
        <h1 className="text-2xl font-semibold text-gray-dark">Welcome back, {user.name.split(" ")[0]}</h1>
        <div className="mt-4 flex gap-4">
          <Link href="/profile" className="text-sm text-gray-mid underline underline-offset-2 hover:text-gray-dark">
            View profile
          </Link>
        </div>
      </div>

      <section>
        <h2 className="text-base font-semibold text-gray-dark mb-4">Recent comments</h2>
        {recentComments.length ? (
          <ul className="space-y-3">
            {recentComments.map((c) => (
              <li key={c.id} className="flex justify-between gap-4 text-sm">
                <Link href={`/${c.postSlug}`} className="text-gray-mid hover:text-gray-dark line-clamp-1 flex-1">
                  {c.content}
                </Link>
                <span className="text-xs text-gray-mid shrink-0">
                  on <Link href={`/${c.postSlug}`} className="underline underline-offset-2">{c.postSlug}</Link>
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-mid">No comments yet.</p>
        )}
      </section>

      <section>
        <h2 className="text-base font-semibold text-gray-dark mb-4">Bookmarked posts</h2>
        {recentBookmarks.length ? (
          <ul className="space-y-2">
            {recentBookmarks.map((b) => (
              <li key={b.id}>
                <Link href={`/${b.postSlug}`} className="text-sm text-gray-mid hover:text-gray-dark underline underline-offset-2">
                  /{b.postSlug}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-mid">No bookmarks yet.</p>
        )}
      </section>

      <section>
        <h2 className="text-base font-semibold text-gray-dark mb-4">Liked posts</h2>
        {recentLikes.length ? (
          <ul className="space-y-2">
            {recentLikes.map((l) => (
              <li key={l.id}>
                <Link href={`/${l.postSlug}`} className="text-sm text-gray-mid hover:text-gray-dark underline underline-offset-2">
                  /{l.postSlug}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-mid">No likes yet.</p>
        )}
      </section>
    </div>
  );
}

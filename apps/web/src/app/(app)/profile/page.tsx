import { headers } from "next/headers";
import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { comment, like, bookmark } from "@/lib/db/schema";
import { eq, count } from "drizzle-orm";
import Image from "next/image";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;

  const { user } = session;

  const [commentsResult, likesResult, bookmarksResult] = await Promise.all([
    db.select({ count: count() }).from(comment).where(eq(comment.userId, user.id)),
    db.select({ count: count() }).from(like).where(eq(like.userId, user.id)),
    db.select({ count: count() }).from(bookmark).where(eq(bookmark.userId, user.id)),
  ]);

  const stats = [
    { label: "Comments", value: Number(commentsResult[0]?.count ?? 0) },
    { label: "Likes given", value: Number(likesResult[0]?.count ?? 0) },
    { label: "Bookmarks", value: Number(bookmarksResult[0]?.count ?? 0) },
  ];

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <div className="flex items-center gap-4">
        {user.image ? (
          <Image src={user.image} alt={user.name} width={64} height={64} className="rounded-full" />
        ) : (
          <div className="w-16 h-16 rounded-full bg-gray-light flex items-center justify-center text-2xl font-semibold text-gray-dark">
            {user.name[0]}
          </div>
        )}
        <div>
          <h1 className="text-2xl font-semibold text-gray-dark">{user.name}</h1>
          <p className="text-sm text-gray-mid">{user.email}</p>
        </div>
      </div>
      <div className="mt-10 grid grid-cols-3 gap-6">
        {stats.map((s) => (
          <div key={s.label} className="rounded-lg border border-gray-light p-4 text-center">
            <p className="text-3xl font-semibold text-gray-dark">{s.value}</p>
            <p className="mt-1 text-sm text-gray-mid">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

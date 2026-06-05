import { db } from "@/lib/db";
import { comment, user } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/server";
import { deleteComment } from "./actions";
import Image from "next/image";

interface Props {
  postSlug: string;
}

export async function CommentList({ postSlug }: Props) {
  const session = await auth.api.getSession({ headers: await headers() });

  const comments = await db
    .select({
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt,
      userId: comment.userId,
      userName: user.name,
      userImage: user.image,
    })
    .from(comment)
    .innerJoin(user, eq(comment.userId, user.id))
    .where(eq(comment.postSlug, postSlug))
    .orderBy(comment.createdAt);

  if (!comments.length) {
    return <p className="text-sm text-gray-mid">No comments yet. Be the first.</p>;
  }

  return (
    <ul className="space-y-6">
      {comments.map((c) => (
        <li key={c.id} className="flex gap-3">
          {c.userImage ? (
            <Image
              src={c.userImage}
              alt={c.userName}
              width={36}
              height={36}
              className="rounded-full shrink-0 mt-0.5"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-gray-light shrink-0 mt-0.5 flex items-center justify-center text-sm font-medium text-gray-dark">
              {c.userName[0]}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-dark">{c.userName}</span>
              <time className="text-xs text-gray-mid" dateTime={c.createdAt.toISOString()}>
                {c.createdAt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
              </time>
              {session?.user.id === c.userId && (
                <form
                  action={async () => {
                    "use server";
                    await deleteComment(c.id, postSlug);
                  }}
                  className="ml-auto"
                >
                  <button type="submit" className="text-xs text-gray-mid hover:text-red transition-colors">
                    Delete
                  </button>
                </form>
              )}
            </div>
            <p className="mt-1 text-sm text-gray-dark whitespace-pre-wrap break-words">{c.content}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

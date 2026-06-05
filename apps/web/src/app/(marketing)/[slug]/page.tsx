import { client, urlFor } from "@/lib/sanity/client";
import { postBySlugQuery, postSlugsQuery } from "@/lib/sanity/queries";
import { PortableText } from "next-sanity";
import Image from "next/image";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { Suspense } from "react";
import type { Metadata } from "next";
import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { like, bookmark } from "@/lib/db/schema";
import { eq, and, count } from "drizzle-orm";
import { CommentList } from "@/features/comments/CommentList";
import { CommentForm } from "@/features/comments/CommentForm";
import { ReactionBar } from "@/features/reactions/ReactionBar";

export const revalidate = 3600;

export async function generateStaticParams() {
  const slugs = await client.fetch(postSlugsQuery);
  return slugs.map((s: { slug: string }) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await client.fetch(postBySlugQuery, { slug }, { next: { tags: [`post:${slug}`] } });
  if (!post) return {};
  return {
    title: `${post.title} — Imagine`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: post.coverImage?.asset
        ? [{ url: urlFor(post.coverImage).width(1200).height(630).url() }]
        : [],
    },
  };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const [post, session] = await Promise.all([
    client.fetch(postBySlugQuery, { slug }, { next: { tags: [`post:${slug}`] } }),
    auth.api.getSession({ headers: await headers() }),
  ]);

  if (!post) notFound();

  const userId = session?.user.id;

  const [likeCountResult, hasLikedResult, hasBookmarkedResult] = await Promise.all([
    db.select({ count: count() }).from(like).where(eq(like.postSlug, slug)),
    userId
      ? db.query.like.findFirst({ where: and(eq(like.postSlug, slug), eq(like.userId, userId)) })
      : Promise.resolve(null),
    userId
      ? db.query.bookmark.findFirst({ where: and(eq(bookmark.postSlug, slug), eq(bookmark.userId, userId)) })
      : Promise.resolve(null),
  ]);

  const likeCount = likeCountResult[0]?.count ?? 0;

  return (
    <article className="max-w-2xl mx-auto px-6 py-16">
      {post.categories?.length > 0 && (
        <span className="text-xs font-medium uppercase tracking-wide text-gray-mid">
          {post.categories[0].title}
        </span>
      )}
      <h1 className="mt-2 text-4xl font-semibold text-gray-dark leading-tight">
        {post.title}
      </h1>
      <div className="mt-3 flex items-center gap-2 text-sm text-gray-mid">
        {post.author?.name && <span>{post.author.name}</span>}
        {post.publishedAt && (
          <>
            <span>·</span>
            <time dateTime={post.publishedAt}>
              {new Date(post.publishedAt).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </time>
          </>
        )}
      </div>
      {post.coverImage?.asset && (
        <div className="relative w-full aspect-[16/9] mt-8 overflow-hidden rounded-lg">
          <Image
            src={urlFor(post.coverImage).width(1200).height(675).url()}
            alt={post.coverImage.alt ?? post.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}
      {post.body && (
        <div className="mt-10 prose prose-gray max-w-none">
          <PortableText value={post.body} />
        </div>
      )}

      <div className="mt-10">
        <ReactionBar
          postSlug={slug}
          likeCount={Number(likeCount)}
          hasLiked={!!hasLikedResult}
          hasBookmarked={!!hasBookmarkedResult}
          isLoggedIn={!!userId}
        />
      </div>

      <section className="mt-12 space-y-8">
        <h2 className="text-lg font-semibold text-gray-dark">Comments</h2>
        <CommentForm postSlug={slug} userId={userId} />
        <Suspense fallback={<p className="text-sm text-gray-mid">Loading comments…</p>}>
          <CommentList postSlug={slug} />
        </Suspense>
      </section>
    </article>
  );
}

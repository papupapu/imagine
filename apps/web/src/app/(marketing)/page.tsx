import { client } from "@/lib/sanity/client";
import { postsQuery } from "@/lib/sanity/queries";
import { urlFor } from "@/lib/sanity/client";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { Footer } from "@/components/footer";

type PostSummary = {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  coverImage?: { asset: { _ref: string } | null; alt?: string };
  publishedAt?: string;
  author?: { name: string };
  categories?: { title: string; slug: string }[];
};

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Imagine",
  description: "A blog about ideas worth sharing.",
};

export default async function HomePage() {
  const posts = await client.fetch(postsQuery, {}, { next: { tags: ["post"] } });

  if (!posts.length) {
    return (
      <div className="flex-1 flex flex-col md:flex-row">
        <div className="flex-1 max-w-3xl mx-auto px-6 py-20 text-center">
          <h1 className="text-3xl font-semibold text-gray-dark">Imagine</h1>
          <p className="mt-4 text-gray-mid">No posts yet. Check back soon.</p>
        </div>
        <Footer className="md:w-[30%] md:max-w-[300px] md:shrink-0 md:border-l" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col md:flex-row">
      <main className="flex-1 min-h-0 max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-semibold text-gray-dark mb-10">Imagine</h1>
        <div className="space-y-10">
          {posts.map((post: PostSummary) => (
            <article key={post._id} className="group">
              <Link href={`/${post.slug}`}>
                {post.coverImage?.asset && (
                  <div className="relative w-full aspect-[16/9] mb-4 overflow-hidden rounded-lg">
                    <Image
                      src={urlFor(post.coverImage).width(800).height(450).url()}
                      alt={post.coverImage.alt ?? post.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="space-y-1">
                  {!!post.categories?.length && (
                    <span className="text-xs font-medium uppercase tracking-wide text-gray-mid">
                      {post.categories[0].title}
                    </span>
                  )}
                  <h2 className="text-xl font-semibold text-gray-dark group-hover:text-gray-mid transition-colors">
                    {post.title}
                  </h2>
                  {post.excerpt && (
                    <p className="text-gray-mid line-clamp-2">{post.excerpt}</p>
                  )}
                  <p className="text-sm text-gray-mid">
                    {post.author?.name && <span>{post.author.name} · </span>}
                    {post.publishedAt && (
                      <time dateTime={post.publishedAt}>
                        {new Date(post.publishedAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </time>
                    )}
                  </p>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </main>
      <Footer className="md:w-[30%] md:max-w-[300px] md:shrink-0 md:border-l" />
    </div>
  );
}

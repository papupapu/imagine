import { client } from "@/lib/sanity/client";
import { postSlugsQuery } from "@/lib/sanity/queries";
import type { MetadataRoute } from "next";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001";
  const slugs: { slug: string }[] = await client.fetch(postSlugsQuery);

  const posts = slugs.map(({ slug }) => ({
    url: `${appUrl}/${slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [
    { url: appUrl, changeFrequency: "daily", priority: 1 },
    ...posts,
  ];
}

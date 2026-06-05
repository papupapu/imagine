import { groq } from "next-sanity";

export const postFields = groq`
  _id,
  title,
  "slug": slug.current,
  excerpt,
  coverImage { asset, alt },
  publishedAt,
  featured,
  "author": author->{ name, "slug": slug.current, image },
  "categories": categories[]->{ title, "slug": slug.current }
`;

export const postsQuery = groq`
  *[_type == "post" && defined(slug.current) && defined(publishedAt)] | order(publishedAt desc) {
    ${postFields}
  }
`;

export const postBySlugQuery = groq`
  *[_type == "post" && slug.current == $slug][0] {
    ${postFields},
    body
  }
`;

export const postSlugsQuery = groq`
  *[_type == "post" && defined(slug.current)] { "slug": slug.current }
`;

export const featuredPostsQuery = groq`
  *[_type == "post" && featured == true && defined(publishedAt)] | order(publishedAt desc)[0..2] {
    ${postFields}
  }
`;

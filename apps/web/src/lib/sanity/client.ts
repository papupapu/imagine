import { createClient } from "next-sanity";
import imageUrlBuilder from "@sanity/image-url";

export const projectId = "45ehuc21";
export const dataset = "production";
export const apiVersion = "2024-01-01";

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
});

const builder = imageUrlBuilder(client);

export function urlFor(source: Parameters<typeof builder.image>[0]) {
  return builder.image(source);
}

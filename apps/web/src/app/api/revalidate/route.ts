import { revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");

  if (secret !== process.env.SANITY_REVALIDATE_SECRET) {
    return NextResponse.json({ message: "Invalid secret" }, { status: 401 });
  }

  const body = await request.json();
  const { _type, slug } = body;

  if (_type === "post") {
    revalidateTag("post", "page");
    if (slug?.current) revalidateTag(`post:${slug.current}`, "page");
  }

  return NextResponse.json({ revalidated: true });
}

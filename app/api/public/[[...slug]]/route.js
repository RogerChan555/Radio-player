import fs from "fs/promises";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  const { slug } = params;

  if (slug) {
    console.log(slug);
    const publicDir = __dirname.split(".next")[0] + "public/";
    const fileUrl = slug.join("/");

    try {
      const data = await fs.readFile(publicDir + fileUrl);
      return new NextResponse(data, { status: 200 });
    } catch (error) {
      return new NextResponse(JSON.stringify({ error: "File not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }
  } else {
    return new NextResponse(JSON.stringify({ error: "File not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }
}

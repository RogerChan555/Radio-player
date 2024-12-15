import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { createAdvertisement } from "@/lib/advertisement";

// To handle a GET request to /api
export async function GET() {
  try {
    // Execute SQL query to fetch advertisements from the database
    const advertisements = await query("SELECT * FROM advertisements");

    // add '/api/public' to advertisement logo, thumbnail, and background image
    if (process.env.NODE_ENV === "production") {
      // add '/api/public' to advertisement logo, thumbnail, and background image
      advertisements.forEach((advertisement) => {
        advertisement.thumbnail = `/api/public${advertisement.thumbnail}`;
      });
    }

    // Return the fetched advertisements
    return NextResponse.json(advertisements, { status: 200 });
  } catch (error) {
    // Return error if any
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

// To handle a POST request to /api/advertisement
export async function POST(request) {
  try {
    const formData = await request.formData();
    const result = await createAdvertisement(formData);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

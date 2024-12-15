import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import fs from "fs";
import path from "path";
import { createAdvertisement } from "@/lib/advertisement";

// To handle a GET request to /api/advertisement/[advertisementId]
export async function GET(request, { params }) {
  const { advertisementId } = params;

  try {
    // Execute SQL query to fetch the advertisement from the database
    const advertisements = await query(
      "SELECT * FROM advertisements WHERE id = ?",
      [advertisementId]
    );

    if (advertisements.length === 0) {
      return NextResponse.json(
        { error: "Advertisement not found" },
        { status: 404 }
      );
    }

    if (process.env.NODE_ENV === "production") {
      // add '/api/public' to advertisement logo, thumbnail, and background image
      advertisements.forEach((advertisement) => {
        advertisement.thumbnail = `/api/public${advertisement.thumbnail}`;
      });
    }

    // Return the fetched advertisement
    return NextResponse.json(advertisements[0], { status: 200 });
  } catch (error) {
    // Return error if any
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

// To handle a POST request to /api/advertisement/[advertisementId]
export async function POST(request, { params }) {
  const advertisementId = params.advertisementId;
  try {
    const formData = await request.formData();

    if (formData.get("_method") === "DELETE") {
      return await deleteAdvertisement(advertisementId);
    }

    formData.append("id", advertisementId);
    const result = await createAdvertisement(formData);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

// To handle a DELETE request to /api/advertisement/[advertisementId]
async function deleteAdvertisement(advertisementId) {
  try {
    const advertisements = await query(
      "SELECT * FROM advertisements WHERE id = ?",
      [advertisementId]
    );

    if (advertisements.length === 0) {
      return NextResponse.json(
        { error: "Advertisement not found" },
        { status: 404 }
      );
    }

    const advertisement = advertisements[0];
    const advertisementNameCamelCase = advertisement.name.replace(/\s/g, "");

    const deleteFileIfExists = (filePath) => {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    };

    if (advertisement.thumbnail) {
      const thumbnailPath = path.join(
        process.cwd(),
        "public",
        "advertisements",
        "thumbnail",
        `${advertisementNameCamelCase}_thumbnail.png`
      );
      deleteFileIfExists(thumbnailPath);
    }

    // Execute SQL query to delete the advertisement from the database
    const result = await query("DELETE FROM advertisements WHERE id = ?", [
      advertisementId,
    ]);

    // Return the result of the delete operation
    return NextResponse.json(
      { message: "Advertisement deleted successfully", result },
      { status: 200 }
    );
  } catch (error) {
    // Return error if any
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

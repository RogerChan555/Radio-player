import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { query } from "@/lib/db";

// GET POST route
export async function POST() {
  try {
    const artists = await query("SELECT * FROM artists");

    // Filter artists with missing images
    const missingImages = artists.filter(
      (artist) =>
        !fs.existsSync(path.join(process.cwd(), "public", artist.image))
    );

    // Download missing images in parallel
    if (missingImages.length) {
      const downloadPromises = missingImages.map(async (artist) => {
        try {
          const artistImage = await fetch(artist.refUrl);
          if (!artistImage.ok) {
            throw new Error(
              `Failed to download image for artist ${artist.artistId}`
            );
          }
          const artistImageArrayBuffer = await artistImage.arrayBuffer();
          const artistImageBuffer = Buffer.from(artistImageArrayBuffer);

          fs.writeFileSync(
            path.join(process.cwd(), "public", artist.image),
            artistImageBuffer
          );

          return `Downloaded artist image: ${artist.artistId}`;
        } catch (error) {
          console.error("Error downloading image:", error);
          return `Failed to download image for artist ${artist.artistId}`;
        }
      });

      const downloadResults = await Promise.all(downloadPromises);
      return NextResponse.json(downloadResults, { status: 200 });
    } else {
      return NextResponse.json(["All artist images already exist"], {
        status: 200,
      });
    }
  } catch (error) {
    console.error("Error fetching artists:", error);
    return NextResponse.json("Failed to fetch artists", { status: 500 });
  }
}

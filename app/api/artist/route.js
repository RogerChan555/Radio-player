import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { query } from "@/lib/db";

// GET API route
export async function GET() {
    // fetch all the files in the public/artists directory
    const artistImages = fs.readdirSync(
        path.join(process.cwd(), "public", "artists")
    );
    // save all the images in artist table one by one
    const artistImagesList = artistImages.map(async (artistImage) => {
        let artist = {
            artistId: artistImage.replace(".webp", ""),
            image: "/artists/" + artistImage,
        };

        // Save all the artist images in the database
        await query("INSERT INTO artists (artistId, image) VALUES (?, ?)", [
            artist.artistId,
            artist.image,
        ]);
        return "Inserted artist image in the database: " + artist.artistId;
    });

    return NextResponse.json({ artistImagesList }, { status: 200 });
}

export async function POST(request) {
    const { artistId, url } = await request.json();

    if (!artistId) {
        return NextResponse.json(
            { error: "Artist ID is required" },
            { status: 400 }
        );
    }

    // Search the artist in the database
    const artists = await query("SELECT * FROM artists WHERE artistId = ?", [
        artistId,
    ]);

    if (artists.length > 0) {
        // console.log(`Artist image already exists!`);
        return NextResponse.json(
            {
                artistImage:
                    (process.env.NODE_ENV === "production"
                        ? "/api/public"
                        : "") + artists[0].image,
            },
            { status: 200 }
        );
    } else {
        return NextResponse.json(
            { error: "Artist image does not exist" },
            { status: 404 }
        );
    }
}

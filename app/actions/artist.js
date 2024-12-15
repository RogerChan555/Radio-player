import path from "path";
import fs from "fs";
import fetch from "node-fetch";
import { JSDOM } from "jsdom";
import { query } from "@/lib/db";

export const getArtistImage = async (artistId, url) => {
  if (!artistId) {
    console.log("No artist ID found");
  } else {
    const artistImageFileName = `${artistId}.webp`;
    const artistImagePath = path.join(
      process.cwd(),
      "public",
      "artists",
      artistImageFileName
    );

    // Search the artist in the database
    const artists = await query("SELECT * FROM artists WHERE artistId = ?", [
      artistId,
    ]);

    if (artists.length == 0) {
      if (!url) {
        console.log("No artist view URL found");
      } else {
        let artistImage = null;
        let artistViewUrl = url;
        try {
          const response = await fetch(artistViewUrl);
          const html = await response.text();
          const dom = new JSDOM(html);
          const { document } = dom.window;

          const artistImageElement = document.querySelector(
            "main picture source"
          );

          if (artistImageElement) {
            artistImage = artistImageElement
              .getAttribute("srcset")
              .split(" ")[0]
              .replace(/\d{1,4}x\d{1,4}/, "1280x1280");
          }

          if (artistImage) {
            const artistImageResponse = await fetch(artistImage);

            const artistImageArrayBuffer =
              await artistImageResponse.arrayBuffer();
            const artistImageBuffer = Buffer.from(artistImageArrayBuffer);

            fs.writeFileSync(artistImagePath, artistImageBuffer);
            console.log(`Artist image saved at ${artistImagePath}`);

            // Save the artist image in the database
            await query(
              "INSERT INTO artists (artistId, refUrl, image) VALUES (?, ?, ?)",
              [artistId, artistImage, `/artists/${artistImageFileName}`]
            );

            return {
              artistId,
              refUrl: artistImage,
              image: `/artists/${artistImageFileName}`,
            };
          } else {
            console.log('No element found with selector "main picture source"');
          }
        } catch (error) {
          console.error("There was a problem fetching the data:", error);
        }
      }
    } else {
      return artists[0];
    }
  }
};

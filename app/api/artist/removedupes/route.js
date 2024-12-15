import { NextResponse } from "next/server";
import { query } from "@/lib/db";

// POST API route
export async function POST() {
  try {
    const artists = await query(`
        DELETE t1 FROM artists t1
        INNER JOIN artists t2
        WHERE t1.artistId = t2.artistId
        AND t1.id > t2.id;

        DELETE FROM artists
        WHERE refUrl IS NULL
        AND artistId IN (
          SELECT artistId
          FROM (
            SELECT artistId
            FROM artists
            WHERE refUrl IS NOT NULL
          ) AS subquery
        );
      `);

    // check if the query was successful
    if (!artists) {
      return NextResponse.json("Failed to remove duplicates", { status: 500 });
    } else {
      return NextResponse.json("Duplicates removed", { status: 200 });
    }
  } catch (error) {
    console.error("Error fetching artists:", error);
    return NextResponse.json("Failed to fetch artists", { status: 500 });
  }
}

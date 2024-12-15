import { NextResponse } from "next/server";
import { query } from "@/lib/db";

// To handle a GET request to /api/station/[stationId]
export async function GET(request, { params }) {
  const { stationId } = params;

  if (!stationId) {
    return NextResponse.json(
      { error: "Station ID is required" },
      { status: 400 }
    );
  }

  try {
    let timeNowinUTC = new Date().toISOString().slice(0, 19).replace("T", " ");
    // Execute SQL query to fetch the next 5 upcoming tracks from the database for the current station where the datetime now is less than the scheduled dateScheduled
    const tracks = await query(
      `SELECT * FROM scheduled_tracks WHERE stationId = ? AND dateScheduled > ? ORDER BY dateScheduled ASC LIMIT 5`,
      [stationId, timeNowinUTC]
    );

    if (process.env.NODE_ENV === "production") {
      // add '/api/public' to artworkURL for production if it starts with '/scheduled/'
      tracks.forEach((track) => {
        if (track.artworkURL.startsWith("/schedule/")) {
          track.artworkURL = `/api/public${track.artworkURL}`;
        }
      });
    }

    // Return the fetched tracks
    return NextResponse.json(tracks, { status: 200 });
  } catch (error) {
    // Return error if any
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

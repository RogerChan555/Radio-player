import { NextResponse } from "next/server";
import { query } from "@/lib/db";

// To handle a GET request to /api/station/[stationId]
export async function GET(request, { params }) {
  const { stationId, scheduleDate } = params;

  try {
    // Execute SQL query to fetch the scheduled tracks from the database
    const tracks = await query(
      `SELECT * FROM scheduled_tracks WHERE stationId = ? AND DATE(dateScheduled) = ? ORDER BY dateScheduled ASC`,
      [stationId, scheduleDate]
    );

    // Return the fetched tracks
    return NextResponse.json(tracks, { status: 200 });
  } catch (error) {
    // Return error if any
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

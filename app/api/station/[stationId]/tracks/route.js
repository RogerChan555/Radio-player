import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request, { params }) {
  const { stationId } = params;

  if (stationId === 0) {
    return NextResponse.json(
      { error: "stationId is required" },
      { status: 400 }
    );
  }

  try {
    // Execute SQL query to fetch tracks from the database based on the stationId
    const tracks = await query(
      "SELECT * FROM tracks WHERE stationId = ? ORDER BY id DESC LIMIT 5",
      [stationId]
    );
    let now = new Date();
    now.setMinutes(now.getMinutes() - 3);
    let currentPlaying = await query(
      "SELECT * FROM playing WHERE stationId = ? AND timestamp > ?",
      [stationId, now]
    );

    if (currentPlaying.length > 0) {
      currentPlaying = currentPlaying[0];
    } else {
      currentPlaying = {};
    }

    // Return the fetched station
    return NextResponse.json(
      { tracks, currentPlaying, timestamp: new Date() },
      { status: 200 }
    );
  } catch (error) {
    // Return error if any
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { query } from "@/lib/db";

// To handle a GET request to /api/station/[stationId]
export async function GET(request, { params }) {
  const { stationId, scheduleDate } = params;

  try {
    // Extract the offset from the query string
    const { searchParams } = new URL(request.url);
    const userOffset = searchParams.get("offset");

    if (!userOffset) {
      throw new Error("Offset parameter is required");
    }

    // Convert offset to hours
    const offsetInHours = parseInt(userOffset, 10) / 60;

    // Dynamically construct the query string with the offset
    const queryString = `
      SELECT * 
      FROM scheduled_tracks 
      WHERE stationId = ? 
        AND DATE(DATE_ADD(dateScheduled, INTERVAL - ${offsetInHours} HOUR)) = ? 
      ORDER BY dateScheduled ASC
    `;

    // Execute the query
    const tracks = await query(queryString, [stationId, scheduleDate]);

    // Return the fetched tracks
    return NextResponse.json(tracks, { status: 200 });
  } catch (error) {
    console.error("Error executing query:", error.message);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

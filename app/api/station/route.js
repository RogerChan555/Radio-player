import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { createStation } from "@/lib/station";

// To handle a GET request to /api
export async function GET(request) {
  try {
    // Execute SQL query to fetch stations from the database
    const stations = await query(
      "SELECT * FROM stations WHERE isActive = 1 ORDER BY orderIndex ASC"
    );

    // add '/api/public' to station logo, thumbnail, and background image
    if (process.env.NODE_ENV === "production") {
      // add '/api/public' to station logo, thumbnail, and background image
      stations.forEach((station) => {
        station.logo = `/api/public${station.logo}`;
        station.thumbnail = `/api/public${station.thumbnail}`;
        station.backgroundImage = `/api/public${station.backgroundImage}`;
      });
    }

    // Return the fetched stations
    return NextResponse.json(stations, { status: 200 });
  } catch (error) {
    // Return error if any
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

// To handle a POST request to /api/station
export async function POST(request) {
  try {
    const formData = await request.formData();
    const result = await createStation(formData);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

import { NextResponse } from "next/server";
import { sortStations } from "@/lib/station";

// To handle a POST request to /api/station
export async function POST(request) {
  try {
    const formData = await request.formData();
    const stationIds = JSON.parse(formData.get("stationIds"));
    const result = await sortStations(stationIds);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

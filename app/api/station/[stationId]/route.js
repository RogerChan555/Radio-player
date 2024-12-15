import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import fs from "fs";
import path from "path";
import { createStation } from "@/lib/station";

// To handle a GET request to /api/station/[stationId]
export async function GET(request, { params }) {
  const { stationId } = params;

  try {
    // Execute SQL query to fetch the station from the database
    const stations = await query("SELECT * FROM stations WHERE id = ?", [
      stationId,
    ]);

    if (stations.length === 0) {
      return NextResponse.json({ error: "Station not found" }, { status: 404 });
    }

    if (process.env.NODE_ENV === "production") {
      // add '/api/public' to station logo, thumbnail, and background image
      stations.forEach((station) => {
        station.logo = `/api/public${station.logo}`;
        station.thumbnail = `/api/public${station.thumbnail}`;
        station.backgroundImage = `/api/public${station.backgroundImage}`;
      });
    }

    // Return the fetched station
    return NextResponse.json(stations[0], { status: 200 });
  } catch (error) {
    // Return error if any
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

// To handle a POST request to /api/station/[stationId]
export async function POST(request, { params }) {
  const stationId = params.stationId;
  try {
    const formData = await request.formData();

    if (formData.get("_method") === "DELETE") {
      return await deleteStation(stationId);
    }

    formData.append("id", stationId);
    const result = await createStation(formData);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

// To handle a DELETE request to /api/station/[stationId]
async function deleteStation(stationId) {
  try {
    const stations = await query("SELECT * FROM stations WHERE id = ?", [
      stationId,
    ]);

    if (stations.length === 0) {
      return NextResponse.json({ error: "Station not found" }, { status: 404 });
    }

    const station = stations[0];
    const stationNameCamelCase = station.name.replace(/\s/g, "");

    const deleteFileIfExists = (filePath) => {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    };

    if (station.logo) {
      const logoPath = path.join(
        process.cwd(),
        "public",
        "stations",
        `${stationNameCamelCase}_logo.png`
      );
      deleteFileIfExists(logoPath);
    }

    if (station.thumbnail) {
      const thumbnailPath = path.join(
        process.cwd(),
        "public",
        "stations",
        "track",
        `${stationNameCamelCase}_thumbnail.png`
      );
      deleteFileIfExists(thumbnailPath);
    }

    if (station.backgroundImage) {
      const backgroundImagePath = path.join(
        process.cwd(),
        "public",
        "stations",
        "background",
        `${stationNameCamelCase}_background.png`
      );
      deleteFileIfExists(backgroundImagePath);
    }

    // Execute SQL query to delete all the 'playing', 'scheduled_tracks', 'tracks' where stationId from the database
    await query("DELETE FROM playing WHERE stationId = ?", [stationId]);
    await query("DELETE FROM scheduled_tracks WHERE stationId = ?", [
      stationId,
    ]);
    await query("DELETE FROM tracks WHERE stationId = ?", [stationId]);

    // Execute SQL query to delete the station from the database
    const result = await query("DELETE FROM stations WHERE id = ?", [
      stationId,
    ]);

    // Return the result of the delete operation
    return NextResponse.json(
      { message: "Station deleted successfully", result },
      { status: 200 }
    );
  } catch (error) {
    // Return error if any
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

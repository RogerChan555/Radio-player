import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { formatDateToMySQL } from "@/lib/utils";
import moment from 'moment';
import path from "path";
import { existsSync } from "fs";
import { unlink } from "fs/promises";

const formatDateParam = (input) => {
  return input < 10 ? `0${input}` : input;
};

// To handle a GET request to /api/station/[stationId]
export async function GET(request, { params }) {
  const { stationId } = params;

  // Parse the request URL to get the query parameters
  const url = new URL(request.url);
  const month = url.searchParams.get("month");
  const year = url.searchParams.get("year");

  if (!month || !year) {
    return NextResponse.json(
      { error: "Month and year parameters are required" },
      { status: 400 }
    );
  }

  try {
    // Execute SQL query to fetch the scheduled tracks from the database for the current month and get count of tracks for each day
    const tracks = await query(
      `SELECT DAY(dateScheduled) as day, COUNT(*) as count FROM scheduled_tracks WHERE stationId = ? AND MONTH(dateScheduled) = ? AND YEAR(dateScheduled) = ? GROUP BY DAY(dateScheduled)`,
      [stationId, month, year]
    );

    const transformedData = tracks.map((track) => {
      return {
        title: `${track.count} - Track${track.count > 1 ? "s" : ""}`,
        date: `${year}-${formatDateParam(month)}-${formatDateParam(track.day)}`,
      };
    });

    // Return the fetched tracks
    return NextResponse.json(transformedData, { status: 200 });
  } catch (error) {
    // Return error if any
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

function generateUniqueVarchar20() {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36).substr(-11);
}

export function addEventsBetweenDates(formData) {
  console.log(formData)
  const isUpdate = formData.get("_method") === "PUT";
  const repeat = formData.get("repeat") !== "false";
  const period = formData.get("period"); // Either 'daily' or 'monthly'

  const daysOfWeek = {
    Sunday: 0,
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
  };

  // Collect selected days of the week (for daily scheduling)
  const selectedDays = Object.keys(daysOfWeek).filter(
    (day) => formData.get(day) === "true"
  );

  // Collect selected days of the month (for monthly scheduling)
  const selectedDaysOfMonth = Array.from({ length: 31 }, (_, i) => `${i + 1}`).filter(
    (day) => formData.get(day) === "true"
  );

  const includeLastDay = formData.get("Last Day") === "true";

  const start = moment(formData.get("dateScheduled"));
  const end = repeat && formData.get("dateScheduledEnd") ? moment(formData.get("dateScheduledEnd")) : start;

  const eventsArray = [];
  let groupId = generateUniqueVarchar20();

  // Iterate through the date range
  for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
    if (isUpdate && date.toISOString() === start.toISOString()) continue; // Skip first iteration for updates

    if (period === "daily") {
      // Daily: Check if the current day matches the selected days
      if (selectedDays.length === 0 || selectedDays.includes(Object.keys(daysOfWeek).find(day => daysOfWeek[day] === date.getDay()))) {
        eventsArray.push(generateEventEntry(date, formData, groupId));
      }
    } else if (period === "monthly") {
      // Monthly: Check if the current day matches the selected days of the month
      const dayOfMonth = date.getDate();
      const isLastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate() === dayOfMonth;

      if (
        selectedDaysOfMonth.includes(`${dayOfMonth}`) ||
        (includeLastDay && isLastDay)
      ) {
        eventsArray.push(generateEventEntry(date, formData, groupId));
      }
    }
  }

  return eventsArray.join(", ");
}

// Helper function to generate an event entry
function generateEventEntry(date, formData, groupId) {
  const values = [
    formData.get("stationId"),
    groupId,
    formData.get("trackId"),
    formData.get("artistId"),
    formData.get("trackName"),
    formData.get("artistName"),
    formData.get("trackViewUrl"),
    formData.get("artworkURL"),
    formatDateToMySQL(new Date(date)),
  ];
  return `(${values.map((value) => `'${value}'`).join(", ")})`;
}


// To handle a POST request to /api/station/[stationId]/schedule
export async function POST(request, { params }) {
  try {
    const formData = await request.formData();

    if (formData.get("_method") === "DELETE") {
      const trackId = formData.get("trackId");
      return await deleteTrack(trackId);
    }
    const isUpdate = formData.get("_method") === "PUT";
    if (isUpdate) {
      const sqlUPDATE = `UPDATE scheduled_tracks 
        SET stationId = ${formData.get("stationId")}, 
        trackId = ${formData.get("trackId")}, 
        artistId = ${formData.get("artistId")}, 
        trackName = '${formData.get("trackName")}', 
        artistName = '${formData.get("artistName")}', 
        trackViewUrl = '${formData.get("trackViewUrl")}', 
        artworkURL = '${formData.get("artworkURL")}', 
        dateScheduled = '${formData.get("dateScheduled")}' 
        WHERE id = ${formData.get("id")}`;
      const resultUPDATE = await query(sqlUPDATE);
      if (resultUPDATE.error) {
        console.log(resultUPDATE.error)
        return NextResponse.json({ error: resultUPDATE.error }, { status: 400 });
      }
    }

    const events = addEventsBetweenDates(formData);
    const sql = `INSERT INTO scheduled_tracks (stationId, groupId, trackId, artistId, trackName, artistName, trackViewUrl, artworkURL, dateScheduled) VALUES ${events}`;
    const result = (events) && await query(sql);
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    // get the inserted track
    const track = await query("SELECT * FROM scheduled_tracks WHERE id = ?", [
      result.insertId || formData.get("id"),
    ]);
    return NextResponse.json(track[0], { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

// To handle a DELETE request to /api/station/[stationId]/schedule
async function deleteTrack(trackId) {
  try {
    if (!trackId) {
      return NextResponse.json(
        { error: "Track ID is required" },
        { status: 400 }
      );
    }

    const track = await query("SELECT * FROM scheduled_tracks WHERE id = ?", [
      trackId,
    ]);
    if (!track.length) {
      return NextResponse.json({ error: "Track not found" }, { status: 404 });
    }

    if (track[0].artworkURL) {
      const filePath = path.join(
        process.cwd(),
        "public",
        "schedule",
        track[0].artworkURL.split("/").pop()
      );

      if (existsSync(filePath)) {
        await unlink(filePath);
      }
    }
    let queryStr = null;
    let params = null;

    if (track[0].groupId != null) {
      let groupId = track[0].groupId;
      queryStr = "DELETE FROM scheduled_tracks WHERE groupId = ?";
      params = [groupId];
    } else {
      queryStr = "DELETE FROM scheduled_tracks WHERE id = ?";
      params = [trackId];
    }

    if (!queryStr) {
      return NextResponse.json({ error: 'Could not delete track/s' }, { status: 400 });
    }
    // Execute SQL query to delete the track from the database
    const result = await query(queryStr, params);

    // Return the result of the delete operation
    return NextResponse.json(
      { message: "Track deleted successfully", result },
      { status: 200 }
    );
  } catch (error) {
    // Return error if any
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

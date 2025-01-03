import {NextResponse} from "next/server";
import {query} from "@/lib/db";
import {formatDateToMySQL} from "@/lib/utils";
import moment from 'moment';
import path from "path";
import {existsSync} from "fs";
import {unlink} from "fs/promises";

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
      `SELECT DAY(dateScheduled) as day, COUNT(*) as count FROM scheduled_tracks WHERE stationId = ? AND MONTH(dateScheduled) = ? GROUP BY DAY(dateScheduled)`,
      [stationId, month]
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

export function addEventsBetweenDates(formData) {
  const isUpdate = formData.get("_method") === "PUT";
  const repeat = formData.get("repeat") !== 'false';
  const daysOfWeek = {
    "Sunday": 0, "Monday": 1, "Tuesday": 2, "Wednesday": 3, "Thursday": 4, "Friday": 5, "Saturday": 6
  };

  let selectedDays = [];
  if (repeat) {
    selectedDays = Object.keys(daysOfWeek).reduce((acc, day) => {
      if (formData.get(day) === 'true') {
        acc.push(daysOfWeek[day]);
      }
      return acc;
    }, []);

    if (formData.get("period") === 'weekends') {
      selectedDays.push(6, 0);
    }
  }

  const start = moment(formData.get("dateScheduled"));
  const end = repeat && formData.get("dateScheduledEnd") ? moment(formData.get("dateScheduledEnd")) : start;
  const eventsArray = [];
  const step = repeat && formData.get("period") ? formData.get("period") : 'daily';

  let incrementFunction;
  switch (step) {
    case 'weekly':
      incrementFunction = (date) => date.setDate(date.getDate() + 7);
      break;
    case 'monthly':
      incrementFunction = (date) => date.setMonth(date.getMonth() + 1);
      break;
    case 'daily':
    default:
      incrementFunction = (date) => date.setDate(date.getDate() + 1);
      break;
  }

  let isFirstIteration = true;

  for (let date = new Date(start); date <= end; incrementFunction(date)) {
    if (isFirstIteration && isUpdate) {
      isFirstIteration = false;
      continue;
    }
    if (selectedDays.length === 0 || selectedDays.includes(date.getDay())) {
      const values = [formData.get("stationId"), formData.get("trackId"), formData.get("artistId"), formData.get("trackName"), formData.get("artistName"), formData.get("trackViewUrl"), formData.get("artworkURL"), formatDateToMySQL(new Date(date)),];
      eventsArray.push(`(${values.map(value => `'${value}'`).join(', ')})`);
    }
  }
  return eventsArray.join(', ');
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
        return NextResponse.json({error: resultUPDATE.error}, {status: 400});
      }
    }

    const events = addEventsBetweenDates(formData);
    const sql = `INSERT INTO scheduled_tracks (stationId, trackId, artistId, trackName, artistName, trackViewUrl, artworkURL, dateScheduled) VALUES ${events}`;
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

    // Execute SQL query to delete the track from the database
    const result = await query("DELETE FROM scheduled_tracks WHERE id = ?", [
      trackId,
    ]);

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

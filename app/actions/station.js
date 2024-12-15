"use server";

import { query } from "@/lib/db";

export const getStations = async (search, offset, pageLimit) => {
  try {
    let params = [];
    // Execute SQL query to fetch stations from the database
    let stationQuery = "SELECT * FROM stations";
    if (search) {
      stationQuery += " WHERE name LIKE ? OR url LIKE ?";
      params = [`%${search}%`, `%${search}%`];
    }

    if (offset) {
      stationQuery += " ORDER BY id DESC LIMIT ? OFFSET ?";
      params.push(pageLimit, offset);
    } else {
      stationQuery += " ORDER BY orderIndex ASC";
    }
    const stations = await query(stationQuery, params);
    let totalStations = await query(
      "SELECT COUNT(*) AS totalStations FROM stations"
    );

    return JSON.parse(
      JSON.stringify({
        stations,
        totalStations: totalStations[0].totalStations,
      })
    );
  } catch (error) {
    console.error("Error fetching stations:", error);
    return { error: "Error fetching stations" };
  }
};

export const getStationsList = async () => {
  try {
    // Execute SQL query to fetch stations from the database
    const stations = await query("SELECT * FROM stations WHERE isActive = 1");
    return {
      stations,
    };
  } catch (error) {
    console.error("Error fetching stations:", error);
    return { error: "Error fetching stations" };
  }
};

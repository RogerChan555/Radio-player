"use server";

import { query } from "@/lib/db";

export const getAdvertisements = async (search, offset, pageLimit) => {
  try {
    let params = [];
    // Execute SQL query to fetch advertisements from the database
    let advertisementQuery = "SELECT * FROM advertisements";
    if (search) {
      advertisementQuery += " WHERE name LIKE ? OR refUrl LIKE ?";
      params = [`%${search}%`, `%${search}%`];
    }

    if (offset) {
      advertisementQuery += " ORDER BY id DESC LIMIT ? OFFSET ?";
      params.push(pageLimit, offset);
    }
    const advertisements = await query(advertisementQuery, params);
    let totalAdvertisements = await query(
      "SELECT COUNT(*) AS totalAdvertisements FROM advertisements"
    );

    return JSON.parse(
      JSON.stringify({
        advertisements,
        totalAdvertisements: totalAdvertisements[0].totalAdvertisements,
      })
    );
  } catch (error) {
    console.error("Error fetching advertisements:", error);
    return { error: "Error fetching advertisements" };
  }
};

export const getAdvertisementByID = async (advertisementId) => {
  try {
    // Execute SQL query to fetch advertisements from the database
    const advertisement = await query(
      "SELECT * FROM advertisements WHERE id = ?",
      [advertisementId]
    );
    return {
      advertisement: advertisement[0],
    };
  } catch (error) {
    console.error("Error fetching advertisements:", error);
    return { error: "Error fetching advertisements" };
  }
};

export const getAdvertisementsList = async () => {
  try {
    // Execute SQL query to fetch advertisements from the database
    const advertisements = await query("SELECT * FROM advertisements");
    return {
      advertisements,
    };
  } catch (error) {
    console.error("Error fetching advertisements:", error);
    return { error: "Error fetching advertisements" };
  }
};

import path from "path";
import { query } from "./db"; // Adjust the import based on your project structure
import { writeFile } from "fs/promises"; // Ensure you use the promises version of writeFile

export const createStation = async (formData) => {
  try {
    const stationId = formData.get("id") || null;
    let oldStation = null;
    if (stationId) {
      oldStation = await getStation(stationId);
      if (oldStation.error || !oldStation.station) {
        return { error: "Error fetching station" };
      }
    }

    const station = {
      isDefault: formData.get("isDefault") == "true" ? 1 : 0,
      isActive: formData.get("isActive") == "true" ? 1 : 0,
      name: formData.get("name"),
      metaPreset: formData.get("metaPreset"),
      refUrl: formData.get("refUrl"),
      url: formData.get("url"),
      donateLink: formData.get("donateLink"),
      gtm: formData.get("gtm"),
      analytics: formData.get("analytics"),
      advertisements: formData.get("advertisements"),
      logo: formData.get("logo"),
      thumbnail: formData.get("thumbnail"),
      backgroundImage: formData.get("backgroundImage"),
    };

    const stationNameCamelCase = station.name.replace(/\s/g, "");

    const handleFileUpload = async (key, file, fileName, filePath) => {
      if (file !== "undefined") {
        const fileBytes = await file.arrayBuffer();
        const fileBuffer = Buffer.from(fileBytes);
        await writeFile(filePath, fileBuffer);
        let imagePath = `/stations/${fileName}`;
        if (key === "thumbnail" || key === "backgroundImage") {
          imagePath = `/stations/${key}/${fileName}`;
        }
        return imagePath;
      }
      return oldStation ? oldStation.station[key] : null;
    };

    station.logo = await handleFileUpload(
      "logo",
      station.logo,
      `${stationNameCamelCase}_logo.png`,
      path.join(
        process.cwd(),
        "public",
        "stations",
        `${stationNameCamelCase}_logo.png`
      )
    );
    station.thumbnail = await handleFileUpload(
      "thumbnail",
      station.thumbnail,
      `${stationNameCamelCase}_thumbnail.png`,
      path.join(
        process.cwd(),
        "public",
        "stations",
        "thumbnail",
        `${stationNameCamelCase}_thumbnail.png`
      )
    );
    station.backgroundImage = await handleFileUpload(
      "backgroundImage",
      station.backgroundImage,
      `${stationNameCamelCase}_background.png`,
      path.join(
        process.cwd(),
        "public",
        "stations",
        "backgroundImage",
        `${stationNameCamelCase}_background.png`
      )
    );

    if (station.isDefault) {
      await query("UPDATE stations SET isDefault = 0");
    }

    if (stationId) {
      await query(
        "UPDATE stations SET isDefault = ?, isActive = ?, metaPreset = ?, name = ?, refUrl = ?, url = ?, donateLink = ?, gtm = ?, analytics = ?, advertisements = ?, logo = ?, thumbnail = ?, backgroundImage = ? WHERE id = ?",
        [
          station.isDefault,
          station.isActive,
          station.metaPreset,
          station.name,
          station.refUrl,
          station.url,
          station.donateLink,
          station.gtm,
          station.analytics,
          station.advertisements,
          station.logo,
          station.thumbnail,
          station.backgroundImage,
          stationId,
        ]
      );
      return { stationId };
    } else {
      const results = await query(
        "INSERT INTO stations (isDefault, isActive, metaPreset, name, refUrl, url, donateLink, gtm, analytics, advertisements, logo, thumbnail, backgroundImage) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [
          station.isDefault,
          station.isActive,
          station.metaPreset,
          station.name,
          station.refUrl,
          station.url,
          station.donateLink,
          station.gtm,
          station.analytics,
          station.advertisements,
          station.logo,
          station.thumbnail,
          station.backgroundImage,
        ]
      );
      return { stationId: results.insertId };
    }
  } catch (error) {
    console.error("Error creating station:", error);
    return { error: "Error creating station" };
  }
};

const getStation = async (stationId) => {
  try {
    // Execute SQL query to fetch station from the database based on the stationId
    const stations = await query("SELECT * FROM stations WHERE id = ?", [
      stationId,
    ]);
    return {
      station: stations[0],
    };
  } catch (error) {
    console.error("Error fetching station:", error);
    return { error: "Error fetching station" };
  }
};

export const sortStations = async (stationIds) => {
  try {
    for (let i = 0; i < stationIds.length; i++) {
      await query("UPDATE stations SET orderIndex = ? WHERE id = ?", [
        i + 1,
        stationIds[i],
      ]);
    }
    return { success: true };
  } catch (error) {
    console.error("Error sorting stations:", error);
    return { error: "Error sorting stations" };
  }
};

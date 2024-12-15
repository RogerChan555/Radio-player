import path from "path";
import { query } from "./db"; // Adjust the import based on your project structure
import { writeFile } from "fs/promises"; // Ensure you use the promises version of writeFile
import { getAdvertisementByID } from "@/app/actions/advertisement";

export const createAdvertisement = async (formData) => {
  try {
    const advertisementId = formData.get("id") || null;
    let oldAdvertisement = null;
    if (advertisementId) {
      oldAdvertisement = await getAdvertisementByID(advertisementId);
      if (oldAdvertisement.error || !oldAdvertisement.advertisement) {
        return { error: "Error fetching advertisement" };
      }
    }

    const advertisement = {
      name: formData.get("name"),
      refUrl: formData.get("refUrl"),
      iFrameUrl: formData.get("iFrameUrl"),
      imageUrl: formData.get("imageUrl"),
      thumbnail: formData.get("thumbnail"),
      googleSlotId: formData.get("googleSlotId"),
    };

    const advertisementNameCamelCase = advertisement.name.replace(/\s/g, "");

    const handleFileUpload = async (key, file, fileName, filePath) => {
      if (file !== "undefined") {
        const fileBytes = await file.arrayBuffer();
        const fileBuffer = Buffer.from(fileBytes);
        await writeFile(filePath, fileBuffer);
        return `/advertisements/${key}/${fileName}`;
      }
      return oldAdvertisement ? oldAdvertisement.advertisement[key] : null;
    };

    advertisement.thumbnail = await handleFileUpload(
      "thumbnail",
      advertisement.thumbnail,
      `${advertisementNameCamelCase}_thumbnail.png`,
      path.join(
        process.cwd(),
        "public",
        "advertisements",
        "thumbnail",
        `${advertisementNameCamelCase}_thumbnail.png`
      )
    );

    if (advertisementId) {
      await query(
        "UPDATE advertisements SET name = ?, refUrl = ?, iFrameUrl = ?, imageUrl = ?, thumbnail = ?, googleSlotId = ? WHERE id = ?",
        [
          advertisement.name,
          advertisement.refUrl,
          advertisement.iFrameUrl,
          advertisement.imageUrl,
          advertisement.thumbnail,
          advertisement.googleSlotId,
          advertisementId,
        ]
      );
      return { advertisementId };
    } else {
      const results = await query(
        "INSERT INTO advertisements (name, refUrl, iFrameUrl, imageUrl, thumbnail, googleSlotId) VALUES (?, ?, ?, ?, ?, ?)",
        [
          advertisement.name,
          advertisement.refUrl,
          advertisement.iFrameUrl,
          advertisement.imageUrl,
          advertisement.thumbnail,
          advertisement.googleSlotId,
        ]
      );
      return { advertisementId: results.insertId };
    }
  } catch (error) {
    console.error("Error creating advertisement:", error);
    return { error: "Error creating advertisement" };
  }
};

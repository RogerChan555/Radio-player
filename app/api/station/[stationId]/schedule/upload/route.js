import { NextResponse } from "next/server";
import path from "path";
import { writeFile,mkdir  } from "fs/promises"; // Ensure you use the promises version of writeFile
import crypto from "crypto";

// To handle a POST request
export async function POST(request) {
  try {
    const formData = await request.formData();

    const handleFileUpload = async (key, file, fileName, filePath) => {
      if (file !== "undefined") {
        const fileBytes = await file.arrayBuffer();
        const fileBuffer = Buffer.from(fileBytes);
        const dir = path.dirname(filePath);
        await mkdir(dir, { recursive: true });
        await writeFile(filePath, fileBuffer);
        return `/schedule/${fileName}`;
      }
      return null;
    };

    const fileExtension = formData.get("thumbnail").type.split("/")[1];

    const generateUniqueFilename = (extension) => {
      const timestamp = Date.now();
      const randomString = crypto.randomBytes(6).toString("hex"); // Generate a random 12-character hex string
      return `${timestamp}_${randomString}_thumbnail.${extension}`;
    };
    
    // Example usage
    const fullFilePath = generateUniqueFilename(fileExtension);

    const result = await handleFileUpload(
      null,
      formData.get("thumbnail"),
      fullFilePath,
      path.join(
        process.cwd(),
        "public",
        "schedule",
        fullFilePath
      )
    );

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(
      {
        thumbnail: result,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

import { NextResponse } from "next/server";
import path from "path";
import { writeFile } from "fs/promises"; // Ensure you use the promises version of writeFile

// To handle a POST request
export async function POST(request) {
  try {
    const formData = await request.formData();

    const handleFileUpload = async (key, file, fileName, filePath) => {
      if (file !== "undefined") {
        const fileBytes = await file.arrayBuffer();
        const fileBuffer = Buffer.from(fileBytes);
        await writeFile(filePath, fileBuffer);
        return `/schedule/${fileName}`;
      }
      return null;
    };

    const fileExtension = formData.get("thumbnail").type.split("/")[1];

    const result = await handleFileUpload(
      null,
      formData.get("thumbnail"),
      `${Date.now()}_thumbnail.${fileExtension}`,
      path.join(
        process.cwd(),
        "public",
        "schedule",
        `${Date.now()}_thumbnail.${fileExtension}`
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

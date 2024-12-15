import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import bcrypt from "bcryptjs";

// To handle a POST request to /api/user/password
export async function POST(request) {
  try {
    const formData = await request.json();
    const userId = formData.id || null;
    const password = formData.password || null;
    const hashedPassword = await bcrypt.hash(password, 10);

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required!" },
        { status: 400 }
      );
    }

    if (!password) {
      return NextResponse.json({ error: "Name is required!" }, { status: 400 });
    }

    const result = await query(
      `
      UPDATE users
      SET password = ?
      WHERE id = ?
    `,
      [hashedPassword, userId]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: "Error updating password!" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Password updated successfully!" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating password:", error);
    return { error: "Error updating password!" };
  }
}

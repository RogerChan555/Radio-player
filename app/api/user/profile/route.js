import { NextResponse } from "next/server";
import { query } from "@/lib/db";

// To handle a POST request to /api/user/profile
export async function POST(request) {
  try {
    const formData = await request.json();
    const userId = formData.id || null;
    const name = formData.name || null;
    const username = formData.username || null;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required!" },
        { status: 400 }
      );
    }

    if (!name) {
      return NextResponse.json({ error: "Name is required!" }, { status: 400 });
    }
    if (!username) {
      return NextResponse.json(
        { error: "Username is required!" },
        { status: 400 }
      );
    }

    const result = await query(
      `
      UPDATE users
      SET name = ?, username = ?
      WHERE id = ?
    `,
      [name, username, userId]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: "Error updating profile!" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Profile updated successfully!" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating profile:", error);
    return { error: "Error updating profile!" };
  }
}

import { NextResponse } from "next/server";
import { getUser, logout } from "@/lib/dal";

// To handle a GET request to /api
export async function GET(request) {
  try {
    let user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json(user[0], { status: 200 });
  } catch (error) {
    // Return error if any
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

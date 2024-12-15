import { NextResponse } from "next/server";
import { logout } from "@/lib/dal";

// To handle a POST request to /api
export async function POST(request) {
  try {
    await logout();
    return NextResponse.json({ status: 200 });
  } catch (error) {
    console.log("Failed to log out user", error);
    // Return error if any
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

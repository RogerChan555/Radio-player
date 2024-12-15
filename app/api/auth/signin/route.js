import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { SignInFormSchema } from "@/lib/definitions";
import { createSession } from "@/lib/session";
import bcrypt from "bcryptjs";

export async function POST(request) {
  const formData = await request.json();
  const validatedFields = SignInFormSchema.safeParse({
    username: formData.username,
    password: formData.password,
  });

  if (!validatedFields.success) {
    return NextResponse.json(
      {
        errors: validatedFields.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  const { username, password } = validatedFields.data;
  const user = await query(`SELECT * FROM users WHERE username = ?`, [
    username,
  ]);

  if (!user.length) {
    return NextResponse.json(
      {
        error: "Invalid username or password.",
      },
      { status: 401 }
    );
  }

  const isValid = bcrypt.compareSync(password, user[0].password);

  if (!isValid) {
    return NextResponse.json(
      {
        error: "Invalid username or password.",
      },
      { status: 401 }
    );
  }

  await createSession(user[0].id);
  return NextResponse.json(user[0], { status: 200 });
}

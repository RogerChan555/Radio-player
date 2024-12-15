import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { SignupFormSchema } from "@/lib/definitions";
import { createSession } from "@/lib/session";
import bcrypt from "bcryptjs";

export async function POST(request) {
    const formData = await request.json();
    const validatedFields = SignupFormSchema.safeParse({
        name: formData.name,
        username: formData.username,
        password: formData.password,
        confirm_password: formData.confirm_password,
    });

    if (!validatedFields.success) {
        return NextResponse.json(
            {
                errors: validatedFields.error.flatten().fieldErrors,
            },
            { status: 400 }
        );
    }

    const { name, username, password } = validatedFields.data;
    const hashedPassword = await bcrypt.hash(password, 10);

    const data = await query(
        `INSERT INTO users (name, username, password) VALUES (?, ?, ?)`,
        [name, username, hashedPassword]
    );

    if (!data.insertId) {
        return NextResponse.json(
            {
                error: "An error occurred while creating your account.",
            },
            { status: 500 }
        );
    }

    const user = await query(`SELECT * FROM users WHERE id = ?`, [
        data.insertId,
    ]);

    if (!user.length) {
        return NextResponse.json(
            {
                error: "An error occurred while creating your account.",
            },
            { status: 500 }
        );
    }

    await createSession(user[0].id);
    console.log("created Session");
    return NextResponse.json(user[0], { status: 201 });
}

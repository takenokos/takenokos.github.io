import bcrypt from "bcryptjs";
import { db, users } from "@db/schema";
import type { APIRoute } from "astro";
import { errorResponse, jsonResponse } from "@/utils/apiResponse";

export const POST: APIRoute = async ({ request }) => {
  try {
    const { email, password, name } = await request.json();
    const hashedPassword = await bcrypt.hash(password, 16);
    const [newUser] = await db
      .insert(users)
      .values({ email, passwordHash: hashedPassword, name, role: "admin" })
      .returning();
    return jsonResponse({
      success: true,
      message: "Register successfully!",
      user: newUser,
    });
  } catch (error) {
    return errorResponse("Server error occurred. Please try again later.");
  }
};

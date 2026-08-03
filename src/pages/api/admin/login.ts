import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { db, users } from "@db/schema";
import { eq, and, or } from "drizzle-orm";
import type { APIRoute } from "astro";
import { JWT_SECRET } from "./JWT.ts";
import { errorResponse, jsonResponse } from "@/utils/apiResponse";

export const POST: APIRoute = async ({ request }) => {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return errorResponse("Email and password are required", 400);
    }

    const userResult = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.email, email),
          or(eq(users.role, "admin"), eq(users.role, "superadmin")),
        ),
      )
      .limit(1);
    if (userResult.length === 0) {
      return errorResponse("Admin user not found", 401);
    }
    const user = userResult[0];
    const isPasswordValid = await bcrypt.compare(
      password,
      user.passwordHash as string,
    );
    if (!isPasswordValid) {
      return errorResponse("Invalid password", 400);
    }
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: "1d",
    });
    return jsonResponse({ token });
  } catch (error) {
    return errorResponse("Server error occurred. Please try again later.");
  }
};

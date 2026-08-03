import { db, users } from "@db/schema";
import { verifyAdminToken } from "../JWT";
import { eq } from "drizzle-orm";
import type { APIRoute } from "astro";
import bcrypt from "bcryptjs";
import {
  errorResponse,
  jsonResponse,
  responseFromError,
} from "@/utils/apiResponse";

const sanitizeUser = <T extends { passwordHash?: string | null }>(user: T) => {
  const { passwordHash, ...rest } = user;
  return rest;
};

export const GET: APIRoute = async ({ request, params }) => {
  try {
    await verifyAdminToken(request);
    const { id } = params;
    if (!id) return errorResponse("User ID is required", 400);

    const user = await db.select().from(users).where(eq(users.id, id));
    if (user.length === 0) return errorResponse("User not found", 404);

    return jsonResponse(sanitizeUser(user[0]));
  } catch (error) {
    return responseFromError(error);
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    await verifyAdminToken(request);
    const { name, email, password, role } = await request.json();

    if (!name || !email || !password || !role) {
      return errorResponse(
        "Missing required fields: name, email, password, role",
        400,
      );
    }

    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email));
    if (existingUser.length > 0) {
      return errorResponse("User with this email already exists", 409);
    }

    const hashedPassword = await bcrypt.hash(password, 16);
    const [newUser] = await db
      .insert(users)
      .values({
        email,
        passwordHash: hashedPassword,
        name,
        role,
      })
      .returning();

    return jsonResponse({ success: true, data: sanitizeUser(newUser) }, 201);
  } catch (error) {
    return responseFromError(error);
  }
};

export const PUT: APIRoute = async ({ request, params }) => {
  try {
    await verifyAdminToken(request);
    const { id } = params;
    const body = await request.json();

    if (!id) return errorResponse("User ID is required", 400);
    if (Object.keys(body).length === 0) {
      return errorResponse("No fields to update", 400);
    }

    if (body.password) {
      body.passwordHash = await bcrypt.hash(body.password, 16);
    }

    const existingUser = await db.select().from(users).where(eq(users.id, id));
    if (existingUser.length === 0) return errorResponse("User not found", 404);

    Object.keys(body).forEach((key) => {
      if (["createdAt", "id", "updatedAt", "password"].includes(key)) {
        delete body[key];
      }
    });

    const [updatedUser] = await db
      .update(users)
      .set(body)
      .where(eq(users.id, id))
      .returning();

    return jsonResponse({ success: true, data: sanitizeUser(updatedUser) });
  } catch (error) {
    return responseFromError(error);
  }
};

export const DELETE: APIRoute = async ({ request, params }) => {
  try {
    await verifyAdminToken(request);
    const { id } = params;
    if (!id) return errorResponse("User ID is required", 400);

    const existingUser = await db.select().from(users).where(eq(users.id, id));
    if (existingUser.length === 0) return errorResponse("User not found", 404);

    await db.delete(users).where(eq(users.id, id));

    return jsonResponse({ success: true });
  } catch (error) {
    return responseFromError(error);
  }
};

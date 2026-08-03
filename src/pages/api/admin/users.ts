import { db, users } from "@db/schema";
import { verifyAdminToken } from "./JWT";
import { eq } from "drizzle-orm";
import type { APIRoute } from "astro";
import { jsonResponse, responseFromError } from "@/utils/apiResponse";

export const GET: APIRoute = async ({ request }) => {
  try {
    await verifyAdminToken(request);
    const adminUsers = await db
      .select()
      .from(users)
      .where(eq(users.role, "admin"));
    return jsonResponse(adminUsers.map(({ passwordHash, ...rest }) => rest));
  } catch (error) {
    return responseFromError(error);
  }
};

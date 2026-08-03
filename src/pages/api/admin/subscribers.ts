import { db, subscribers } from "@db/schema";
import { verifyAdminToken } from "./JWT";
import { desc } from "drizzle-orm";
import type { APIRoute } from "astro";
import { jsonResponse, responseFromError } from "@/utils/apiResponse";

export const GET: APIRoute = async ({ request }) => {
  try {
    await verifyAdminToken(request);
    const data = await db
      .select()
      .from(subscribers)
      .orderBy(desc(subscribers.createdAt));

    return jsonResponse({ success: true, data });
  } catch (error) {
    return responseFromError(error);
  }
};

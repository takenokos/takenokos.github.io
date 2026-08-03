import { db, categories } from "@db/schema";
import { verifyAdminToken } from "./JWT";
import type { APIRoute } from "astro";
import { jsonResponse, responseFromError } from "@/utils/apiResponse";

export const GET: APIRoute = async ({ request }) => {
  try {
    await verifyAdminToken(request);
    const allCategories = await db.select().from(categories); // Selects all fields
    return jsonResponse({ success: true, data: allCategories });
  } catch (error) {
    return responseFromError(error);
  }
};

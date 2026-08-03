import { db, subscribers } from "@db/schema";
import { verifyAdminToken } from "../JWT";
import { eq } from "drizzle-orm";
import type { APIRoute } from "astro";
import {
  errorResponse,
  jsonResponse,
  responseFromError,
} from "@/utils/apiResponse";

const allowedStatuses = new Set(["active", "inactive", "archived"]);

export const PUT: APIRoute = async ({ request, params }) => {
  try {
    await verifyAdminToken(request);
    const { id } = params;
    if (!id) return errorResponse("Subscriber ID is required", 400);

    const { status } = await request.json();
    if (!allowedStatuses.has(status)) {
      return errorResponse("Invalid subscriber status", 400);
    }

    const [updated] = await db
      .update(subscribers)
      .set({ status })
      .where(eq(subscribers.id, id))
      .returning();

    if (!updated) return errorResponse("Subscriber not found", 404);

    return jsonResponse({ success: true, data: updated });
  } catch (error) {
    return responseFromError(error);
  }
};

export const DELETE: APIRoute = async ({ request, params }) => {
  try {
    await verifyAdminToken(request);
    const { id } = params;
    if (!id) return errorResponse("Subscriber ID is required", 400);

    const deleted = await db
      .delete(subscribers)
      .where(eq(subscribers.id, id))
      .returning({ id: subscribers.id });

    if (deleted.length === 0) return errorResponse("Subscriber not found", 404);

    return jsonResponse({ success: true, data: deleted[0] });
  } catch (error) {
    return responseFromError(error);
  }
};

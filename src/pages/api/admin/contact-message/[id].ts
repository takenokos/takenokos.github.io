import { db, contactMessages } from "@db/schema";
import { verifyAdminToken } from "../JWT";
import { eq } from "drizzle-orm";
import type { APIRoute } from "astro";
import {
  errorResponse,
  jsonResponse,
  responseFromError,
} from "@/utils/apiResponse";

const allowedStatuses = new Set(["pending", "read", "archived"]);

export const PUT: APIRoute = async ({ request, params }) => {
  try {
    await verifyAdminToken(request);
    const { id } = params;
    if (!id) return errorResponse("Contact message ID is required", 400);

    const { status } = await request.json();
    if (!allowedStatuses.has(status)) {
      return errorResponse("Invalid contact message status", 400);
    }

    const [updated] = await db
      .update(contactMessages)
      .set({ status })
      .where(eq(contactMessages.id, id))
      .returning();

    if (!updated) return errorResponse("Contact message not found", 404);

    return jsonResponse({ success: true, data: updated });
  } catch (error) {
    return responseFromError(error);
  }
};

export const DELETE: APIRoute = async ({ request, params }) => {
  try {
    await verifyAdminToken(request);
    const { id } = params;
    if (!id) return errorResponse("Contact message ID is required", 400);

    const deleted = await db
      .delete(contactMessages)
      .where(eq(contactMessages.id, id))
      .returning({ id: contactMessages.id });

    if (deleted.length === 0) {
      return errorResponse("Contact message not found", 404);
    }

    return jsonResponse({ success: true, data: deleted[0] });
  } catch (error) {
    return responseFromError(error);
  }
};

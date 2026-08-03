import { db, comments } from "@db/schema";
import { verifyAdminToken } from "../JWT";
import { eq } from "drizzle-orm";
import type { APIRoute } from "astro";
import {
  errorResponse,
  jsonResponse,
  responseFromError,
} from "@/utils/apiResponse";

export const DELETE: APIRoute = async ({ request, params }) => {
  try {
    await verifyAdminToken(request);
    const { id } = params;

    if (!id) return errorResponse("Comment ID is required", 400);

    const deleted = await db
      .delete(comments)
      .where(eq(comments.id, id))
      .returning({ id: comments.id });

    if (deleted.length === 0) return errorResponse("Comment not found", 404);

    return jsonResponse({ success: true, data: deleted[0] });
  } catch (error) {
    return responseFromError(error);
  }
};

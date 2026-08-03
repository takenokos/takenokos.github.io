import { db, comments, users } from "@db/schema";
import { verifyAdminToken } from "./JWT";
import { desc, eq } from "drizzle-orm";
import type { APIRoute } from "astro";
import { jsonResponse, responseFromError } from "@/utils/apiResponse";

export const GET: APIRoute = async ({ request }) => {
  try {
    await verifyAdminToken(request);

    const data = await db
      .select({
        id: comments.id,
        postId: comments.postId,
        commentText: comments.commentText,
        createdAt: comments.createdAt,
        username: users.name,
        email: users.email,
      })
      .from(comments)
      .leftJoin(users, eq(comments.userId, users.id))
      .orderBy(desc(comments.createdAt));

    return jsonResponse({ success: true, data });
  } catch (error) {
    return responseFromError(error);
  }
};

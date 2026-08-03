import type { APIRoute } from "astro";
import { db, comments, users } from "@db/schema"; // Import the schema
import { getSession } from "auth-astro/server";
import { eq, asc } from "drizzle-orm";
import { errorResponse, jsonResponse } from "@/utils/apiResponse";

export const POST: APIRoute = async ({ request, params }) => {
  const session = await getSession(request);
  if (!session?.user?.id) {
    return errorResponse("Unauthorized", 401);
  }

  const { postId } = params;
  const body = await request.json();
  const { commentText } = body;

  if (!commentText || typeof commentText !== "string") {
    return errorResponse("Invalid input", 400);
  }

  try {
    const newComment = await db
      .insert(comments)
      .values({
        postId: postId as string,
        userId: session.user.id,
        commentText,
      })
      .returning();

    return jsonResponse(
      newComment.map((comment) => ({
        id: comment.id,
        commentText: comment.commentText,
        createdAt: comment.createdAt,
        username: session?.user?.name,
        avatar: session?.user?.image,
      })),
      201,
    );
  } catch (error) {
    return errorResponse("Database error", 500);
  }
};

export const GET: APIRoute = async ({ params }) => {
  const { postId } = params;
  try {
    const commentsList = await db
      .select({
        id: comments.id,
        commentText: comments.commentText,
        createdAt: comments.createdAt,
        username: users.name,
        avatar: users.image,
      })
      .from(comments)
      .where(eq(comments.postId, postId as string))
      .leftJoin(users, eq(comments.userId, users.id))
      .orderBy(asc(comments.createdAt));
    return jsonResponse(commentsList);
  } catch (error) {
    return errorResponse("Database error", 500);
  }
};

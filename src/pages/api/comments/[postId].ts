import type { APIRoute } from 'astro';
import { db, comments, users } from '@db/schema'; // Import the schema
import { getSession } from "auth-astro/server";
import { eq, asc } from 'drizzle-orm'

export const POST: APIRoute = async ({ request, params }) => {
  const session = await getSession(request);
  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const { postId } = params;
  const body = await request.json();
  const { commentText } = body;

  if (!commentText || typeof commentText !== 'string') {
    return new Response(JSON.stringify({ error: 'Invalid input' }), { status: 400 });
  }

  try {
    const newComment = await db.insert(comments).values({
      postId: postId as string,
      userId: session.user.id,
      commentText,
    }).returning();

    return new Response(JSON.stringify(newComment.map(comment => ({
      commentText: comment.commentText,
      createdAt: comment.createdAt,
      username: session?.user?.name,
      avatar: session?.user?.image
    }))), { status: 201 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Database error' }), { status: 500 });
  }
};

export const GET: APIRoute = async ({ params }) => {
  const { postId } = params;
  try {
    const commentsList = await db.select({
      commentText: comments.commentText,
      createdAt: comments.createdAt,
      username: users.name,
      avatar: users.image
    }
    ).from(comments).where(eq(comments.postId, postId as string)).leftJoin(users, eq(comments.userId, users.id)).orderBy(asc(comments.createdAt));
    return new Response(JSON.stringify(commentsList), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Database error' }), { status: 500 });
  }
};

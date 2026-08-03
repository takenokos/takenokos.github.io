import {
  categories,
  comments,
  contactMessages,
  db,
  products,
  subscribers,
  users,
} from "@db/schema";
import { verifyAdminToken } from "./JWT";
import { count, desc, eq } from "drizzle-orm";
import type { APIRoute } from "astro";
import { jsonResponse, responseFromError } from "@/utils/apiResponse";

export const GET: APIRoute = async ({ request }) => {
  try {
    await verifyAdminToken(request);

    const [
      productCount,
      categoryCount,
      pendingContactCount,
      subscriberCount,
      commentCount,
      adminCount,
      latestContacts,
      latestComments,
    ] = await Promise.all([
      db.select({ value: count() }).from(products),
      db.select({ value: count() }).from(categories),
      db
        .select({ value: count() })
        .from(contactMessages)
        .where(eq(contactMessages.status, "pending")),
      db
        .select({ value: count() })
        .from(subscribers)
        .where(eq(subscribers.status, "active")),
      db.select({ value: count() }).from(comments),
      db.select({ value: count() }).from(users).where(eq(users.role, "admin")),
      db
        .select({
          id: contactMessages.id,
          name: contactMessages.name,
          email: contactMessages.email,
          status: contactMessages.status,
          createdAt: contactMessages.createdAt,
        })
        .from(contactMessages)
        .orderBy(desc(contactMessages.createdAt))
        .limit(5),
      db
        .select({
          id: comments.id,
          postId: comments.postId,
          commentText: comments.commentText,
          createdAt: comments.createdAt,
        })
        .from(comments)
        .orderBy(desc(comments.createdAt))
        .limit(5),
    ]);

    return jsonResponse({
      success: true,
      data: {
        stats: {
          products: productCount[0]?.value ?? 0,
          categories: categoryCount[0]?.value ?? 0,
          pendingContacts: pendingContactCount[0]?.value ?? 0,
          activeSubscribers: subscriberCount[0]?.value ?? 0,
          comments: commentCount[0]?.value ?? 0,
          admins: adminCount[0]?.value ?? 0,
        },
        latestContacts,
        latestComments,
      },
    });
  } catch (error) {
    return responseFromError(error, "Failed to load dashboard.");
  }
};

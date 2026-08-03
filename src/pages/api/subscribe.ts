import { db, subscribers } from "@db/schema";
import { eq } from "drizzle-orm";
import type { APIRoute } from "astro";
import { errorResponse, jsonResponse } from "@/utils/apiResponse";

export const POST: APIRoute = async ({ request }) => {
  if (request.method !== "POST") {
    return errorResponse("Method not allowed", 405);
  }

  try {
    const body = await request.json();
    const { email } = body;

    // Basic email validation
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return errorResponse("Invalid email format", 400);
    }

    // Check if email already exists
    const existingSubscribers = await db
      .select()
      .from(subscribers)
      .where(eq(subscribers.email, email))
      .limit(1);
    if (existingSubscribers.length > 0) {
      return errorResponse("Email already subscribed", 409);
    }

    // Insert new subscribers
    await db.insert(subscribers).values({ email });

    return jsonResponse(
      { success: true, message: "Subscribed successfully" },
      201,
    );
  } catch (error) {
    return errorResponse("Internal server error");
  }
};

import { db, contactMessages } from "@db/schema";
import type { APIRoute } from "astro";
import { errorResponse, jsonResponse } from "@/utils/apiResponse";

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.json();
    const { name, email, message } = formData;

    // 简单验证
    if (!name || !email || !message) {
      return errorResponse("All fields are required.", 400);
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      return errorResponse("Invalid email address.", 400);
    }

    // 插入数据到数据库
    await db.insert(contactMessages).values({ name, email, message });

    return jsonResponse({
      success: true,
      message: "Message sent successfully!",
    });
  } catch (error) {
    return errorResponse("Server error occurred. Please try again later.");
  }
};

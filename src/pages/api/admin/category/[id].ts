import { db, categories } from "@db/schema";
import { verifyAdminToken } from "../JWT";
import { eq } from "drizzle-orm";
import type { APIRoute } from "astro";
import {
  errorResponse,
  jsonResponse,
  responseFromError,
} from "@/utils/apiResponse";

export const GET: APIRoute = async ({ request, params }) => {
  try {
    await verifyAdminToken(request);
    const { id } = params;
    if (!id) return errorResponse("Category ID is required", 400);

    const category = await db
      .select()
      .from(categories)
      .where(eq(categories.id, id));

    return jsonResponse({ success: true, data: category[0] || null });
  } catch (error) {
    return responseFromError(error);
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    await verifyAdminToken(request);
    const { name, description } = await request.json();
    if (!name) return errorResponse("Category name is required", 400);

    const newCategory = await db
      .insert(categories)
      .values({ name, description })
      .returning();

    return jsonResponse({ success: true, data: newCategory }, 201);
  } catch (error) {
    return responseFromError(error);
  }
};

export const PUT: APIRoute = async ({ request, params }) => {
  try {
    await verifyAdminToken(request);
    const { id } = params;
    if (!id) return errorResponse("Category ID is required", 400);

    const { name, description } = await request.json();
    const updatedCategory = await db
      .update(categories)
      .set({ name, description })
      .where(eq(categories.id, id))
      .returning();

    if (updatedCategory.length === 0) {
      return errorResponse("Category not found", 404);
    }

    return jsonResponse({ success: true, data: updatedCategory[0] });
  } catch (error) {
    return responseFromError(error);
  }
};

export const DELETE: APIRoute = async ({ request, params }) => {
  try {
    await verifyAdminToken(request);
    const { id } = params;
    if (!id) return errorResponse("Category ID is required", 400);

    const deletedCategory = await db
      .delete(categories)
      .where(eq(categories.id, id))
      .returning();

    if (deletedCategory.length === 0) {
      return errorResponse("Category not found", 404);
    }

    return jsonResponse({ success: true, data: deletedCategory[0] });
  } catch (error) {
    return responseFromError(error);
  }
};

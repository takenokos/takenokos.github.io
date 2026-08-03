import { db, products, categories } from "@db/schema";
import { eq } from "drizzle-orm";
import type { APIRoute } from "astro";
import { jsonResponse, responseFromError } from "@/utils/apiResponse";

export const GET: APIRoute = async ({ params }) => {
  try {
    const { category } = params;
    let query = db.select().from(products).limit(20); // Paginate for performance

    if (category && category !== "all") {
      const categoryId = await db
        .select({ id: categories.id })
        .from(categories)
        .where(eq(categories.name, category));
      if (categoryId.length > 0) {
        query.$dynamic().where(eq(products.categoryId, categoryId[0].id));
      }
    }

    const data = await query;
    return jsonResponse(data);
  } catch (error) {
    return responseFromError(error, "Failed to fetch products.");
  }
};

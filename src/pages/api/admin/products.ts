import { and, count, eq, gt, ilike, type SQL } from "drizzle-orm";
import { db, products } from "@/db/schema";
import { verifyAdminToken } from "./JWT";
import type { APIRoute } from "astro";
import { z } from "zod";
import {
  errorResponse,
  jsonResponse,
  responseFromError,
} from "@/utils/apiResponse";

// Define a Zod schema for validating and coercing query parameters
const productQuerySchema = z.object({
  search: z.string().optional(),
  categoryId: z.string().optional(), // Assuming categoryId is a string. If it's a number, use z.coerce.number().optional()
  stock: z.coerce.number().int().min(0).default(0),
  limit: z.coerce.number().int().min(1).max(100).default(10), // Added max limit for safety
  offset: z.coerce.number().int().min(0).default(0),
});

/**
 * @description Get a paginated and filtered list of products for the admin panel.
 *              Uses Zod for robust query parameter validation.
 */
export const GET: APIRoute = async ({ request }) => {
  try {
    // 1. Authenticate the admin user
    await verifyAdminToken(request);

    const params = new URL(request.url).searchParams;

    // 2. Validate query parameters using Zod
    const validation = productQuerySchema.safeParse(Object.fromEntries(params));

    if (!validation.success) {
      return errorResponse(
        "Invalid query parameters",
        400,
        validation.error.flatten(),
      );
    }

    // Use validated and typed data from Zod
    const { search, categoryId, stock, limit, offset } = validation.data;

    // 3. Build the dynamic query conditions
    const conditions: SQL[] = [];
    if (search) {
      conditions.push(ilike(products.name, `%${search}%`));
    }
    if (categoryId) {
      conditions.push(eq(products.categoryId, categoryId));
    }
    if (stock > 0) {
      conditions.push(gt(products.stock, stock));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // 4. Execute queries for data and total count in parallel
    const [result, totalResult] = await Promise.all([
      db
        .select()
        .from(products)
        .where(whereClause)
        .limit(limit)
        .offset(offset)
        .orderBy(products.id),
      db.select({ total: count() }).from(products).where(whereClause),
    ]);

    const total = totalResult[0]?.total ?? 0;

    // 5. Return a structured response
    const responsePayload = {
      data: result,
      pagination: {
        total,
        limit,
        offset,
        hasMore: total > offset + result.length,
      },
    };

    return jsonResponse(responsePayload);
  } catch (error) {
    console.error("Error fetching products:", error);
    return responseFromError(
      error,
      "An unexpected error occurred while fetching products.",
    );
  }
};

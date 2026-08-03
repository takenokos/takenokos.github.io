import {
  db,
  products,
  productVariants,
  productAttributeValues,
  productAttributes,
} from "@db/schema";
import { eq, and } from "drizzle-orm";
import type { APIRoute } from "astro";
import {
  errorResponse,
  jsonResponse,
  responseFromError,
} from "@/utils/apiResponse";

const GETVariantsForProduct = async (productId: string) => {
  const variants = await db
    .select()
    .from(productVariants)
    .where(eq(productVariants.productId, productId));

  const attributes = await db.query.productAttributes.findMany({
    where: eq(productAttributes.productId, productId),
    with: {
      values: true,
    },
  });

  return {
    variants,
    attributes, // Return attributes and their values
  };
};
export const GET: APIRoute = async ({ params }) => {
  try {
    const { slug } = params;
    const data = await db
      .select()
      .from(products)
      .where(eq(products.slug, slug as string))
      .limit(1);
    if (data.length > 0) {
      const variantsData = await GETVariantsForProduct(data[0].id);
      return jsonResponse({ product: data[0], ...variantsData });
    } else {
      return errorResponse("Product not found", 404);
    }
  } catch (error) {
    return responseFromError(error, "Failed to fetch product.");
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json(); // e.g., { productId: 1, combinations: { "color": "Red", "size": "M" } }
    if (!body.productId || !body.combinations) {
      return errorResponse("Invalid variant request", 400);
    }

    const matchingVariant = await db
      .select()
      .from(productVariants)
      .where(
        and(
          eq(productVariants.productId, body.productId),
          eq(productVariants.combinations, body.combinations), // JSON equality
        ),
      )
      .limit(1);

    if (matchingVariant.length > 0) {
      return jsonResponse(matchingVariant[0]); // Return SKU, price, stock
    } else {
      return errorResponse("Variant not available", 400);
    }
  } catch (error) {
    return responseFromError(error, "Failed to validate product variant.");
  }
};

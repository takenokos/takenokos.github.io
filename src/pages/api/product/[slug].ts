import {
  db,
  products,
  productVariants,
  productAttributeValues,
  productAttributes,
} from "@db/schema";
import { eq, and } from "drizzle-orm";
import type { APIRoute } from "astro";

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
  const { slug } = params;
  const data = await db
    .select()
    .from(products)
    .where(eq(products.slug, slug as string))
    .limit(1);
  if (data.length > 0) {
    const variantsData = await GETVariantsForProduct(data[0].id);
    return new Response(JSON.stringify({ product: data[0], ...variantsData }), {
      status: 200,
    });
  } else {
    return new Response("Product not found", { status: 404 });
  }
};

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json(); // e.g., { productId: 1, combinations: { "color": "Red", "size": "M" } }
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
    return new Response(JSON.stringify(matchingVariant[0]), { status: 200 }); // Return SKU, price, stock
  } else {
    return new Response("Variant not available", { status: 400 });
  }
};

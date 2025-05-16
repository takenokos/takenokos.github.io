import { db, products, categories } from '@db/schema';
import { eq } from 'drizzle-orm';
import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ params }) => {
  const { category } = params
  let query = db.select().from(products).limit(20); // Paginate for performance

  if (category) {
    const categoryId = await db.select({ id: categories.id }).from(categories).where(eq(categories.name, category));
    if (categoryId.length > 0) {
      query.$dynamic().where(eq(products.categoryId, categoryId[0].id));
    }
  }

  const data = await query;
  return new Response(JSON.stringify(data), { status: 200, headers: { 'Content-Type': 'application/json' } });
}


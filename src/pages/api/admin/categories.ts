import { db, categories, } from '@db/schema';
import { verifyAdminToken } from './JWT';
import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ request }) => {
  try {
    await verifyAdminToken(request);
    const allCategories = await db.select().from(categories);  // Selects all fields
    return new Response(JSON.stringify({ success: true, data: allCategories }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 401 });
  }
}

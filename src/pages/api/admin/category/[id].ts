import { db, categories } from '@db/schema';
import { verifyAdminToken } from '../JWT';
import { eq } from 'drizzle-orm';
import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ request, params }) => {
  try {
    await verifyAdminToken(request);
    const { id } = params
    const category = await db.select().from(categories).where(eq(categories.id, id as string));
    return new Response(JSON.stringify({ success: true, data: category[0] || null }), {
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 401 });
  }
}

export const POST: APIRoute = async ({ request }) => {
  try {

    await verifyAdminToken(request); // 验证Admin Token
    const { name, description } = await request.json(); // 解析请求体
    const newCategory = await db.insert(categories).values({
      name,
      description,
    }).returning();  // Returns the inserted row
    return new Response(JSON.stringify({ success: true, data: newCategory }), { status: 201 });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 401 });
  }
}


export const PUT: APIRoute = async ({ request, params }) => {
  try {
    await verifyAdminToken(request);
    const { id } = params
    if (!id) {
      return new Response(JSON.stringify({ error: 'Catrgory ID is required' }), { status: 400 });
    }
    const { name, description } = await request.json(); // e.g., { id: number, role: string }
    const updatedCategory = await db.update(categories)
      .set({ name, description })  // Only set provided fields
      .where(eq(categories.id, id))
      .returning();  // Returns the updated row
    if (updatedCategory.length === 0) {
      return new Response(JSON.stringify({ success: false, error: 'Category not found' }), { status: 404 });
    }
    return new Response(JSON.stringify({ success: true, data: updatedCategory[0] }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 401 });
  }
}

export const DELETE: APIRoute = async ({ request, params }) => {
  try {
    await verifyAdminToken(request); // 验证Admin Token
    const { id } = params
    if (!id) {
      return new Response(JSON.stringify({ error: 'Category ID is required' }), { status: 400 });
    }
    const deletedCategory = await db.delete(categories)
      .where(eq(categories.id, id))
      .returning();  // Returns the deleted row for confirmation
    if (deletedCategory.length === 0) {
      return new Response(JSON.stringify({ success: false, error: 'Category not found' }), { status: 404 });
    }
    return new Response(JSON.stringify({ success: true, data: deletedCategory[0] }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 401 });
  }
}

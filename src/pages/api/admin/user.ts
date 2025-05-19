import { db, users } from '@db/schema';
import { verifyAdminToken } from './JWT';
import { eq } from 'drizzle-orm';
import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ request }) => {
  try {
    await verifyAdminToken(request);
    const adminUsers = await db.select().from(users).where(eq(users.role, 'admin'));
    return new Response(JSON.stringify(adminUsers), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 401 });
  }
}

export const POST: APIRoute = async ({ request }) => {
  try {
    await verifyAdminToken(request);
    const { userId, ...updateFields } = await request.json(); // e.g., { userId: number, role: string }
    if (!userId) {
      return new Response(JSON.stringify({ error: "userId is required" }), { status: 400 });
    }

    await db.update(users).set(updateFields).where(eq(users.id, userId));
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 401 });
  }
}

import { db, users } from '@db/schema';
import { verifyAdminToken } from './JWT';
import { eq } from 'drizzle-orm';
import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ request }) => {
  try {
    await verifyAdminToken(request);
    const adminUsers = await db.select().from(users).where(eq(users.role, 'admin'));
    return new Response(JSON.stringify(adminUsers.map(({ passwordHash, ...rest }) => rest)), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 401 });
  }
}

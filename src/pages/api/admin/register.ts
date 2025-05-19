import bcrypt from 'bcryptjs';
import { db, users } from '@db/schema';
import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { email, password, name } = await request.json()
    const hashedPassword = await bcrypt.hash(password, 16);
    const [newUser] = await db.insert(users).values({ email, passwordHash: hashedPassword, name, role: 'admin' }).returning();
    return new Response(JSON.stringify({ success: true, message: 'Register successfully!', user: newUser }), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Server error occurred. Please try again later.' }), { status: 500 });
  }
}

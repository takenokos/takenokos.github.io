import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { db, users } from '@db/schema';
import { eq, and, or } from 'drizzle-orm';
import type { APIRoute } from 'astro';
import { JWT_SECRET } from './JWT.ts'

export const POST: APIRoute = async ({ request }) => {
  try {
    const { email, password } = await request.json()
    if (!email || !password) {
      return new Response(JSON.stringify({ error: 'Email and password are required' }), { status: 400 });
    }

    const userResult = await db.select().from(users).where(and(eq(users.email, email), or(eq(users.role, 'admin'), eq(users.role, 'superadmin')))).limit(1);
    if (userResult.length === 0) {
      return new Response(JSON.stringify({ error: 'Admin user not found' }), { status: 401 });
    }
    const user = userResult[0];
    console.log(password, user.passwordHash)
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash as string);
    if (!isPasswordValid) {
      return new Response(JSON.stringify({ error: 'Invalid password' }), { status: 400 });
    }
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
    return new Response(JSON.stringify({ token }), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Server error occurred. Please try again later.' }), { status: 500 });
  }
}

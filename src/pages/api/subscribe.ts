import { db, subscribers } from '@db/schema';
import { eq } from "drizzle-orm";
import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  try {
    const body = await request.json();
    const { email } = body;

    // Basic email validation
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(JSON.stringify({ error: 'Invalid email format' }), { status: 400 });
    }


    // Check if email already exists
    const existingSubscribers = await db.select().from(subscribers).where(eq(subscribers.email, email)).limit(1);
    if (existingSubscribers.length > 0) {
      return new Response(JSON.stringify({ error: 'Email already subscribed' }), { status: 409 });
    }

    // Insert new subscribers
    await db.insert(subscribers).values({ email });

    return new Response(JSON.stringify({ success: true, message: 'Subscribed successfully' }), { status: 201 });
  } catch (error) {
    console.error('subscriberserror:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}

import { db, contactMessages } from '@db/schema';
import type { APIRoute } from 'astro';


export const POST: APIRoute = async ({ request }) => {
    try {
      const formData = await request.json();
      const { name, email, message } = formData;

      // 简单验证
      if (!name || !email || !message) {
        return new Response(JSON.stringify({ error: 'All fields are required.' }), { status: 400 });
      }
      if (!/\S+@\S+\.\S+/.test(email)) {
        return new Response(JSON.stringify({ error: 'Invalid email address.' }), { status: 400 });
      }

      // 插入数据到数据库
      await db.insert(contactMessages).values({ name, email, message });

      return new Response(JSON.stringify({ success: true, message: 'Message sent successfully!' }), { status: 200 });
    } catch (error) {
      console.error(error);
      return new Response(JSON.stringify({ error: 'Server error occurred. Please try again later.' }), { status: 500 });
    }
};

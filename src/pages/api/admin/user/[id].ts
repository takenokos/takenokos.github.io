import { db, users } from '@db/schema';
import { verifyAdminToken } from '../JWT';
import { eq } from 'drizzle-orm';
import type { APIRoute } from 'astro';
import bcrypt from 'bcryptjs';

export const GET: APIRoute = async ({ request, params }) => {
  try {
    await verifyAdminToken(request);
    const { id } = params
    const user = await db.select().from(users).where(eq(users.id, id as string));
    if (user.length === 0) {
      return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
    }
    // 移除敏感信息，如密码
    const safeUser = user.map(({ passwordHash, ...rest }) => rest);
    return new Response(JSON.stringify(safeUser[0]), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 401 });
  }
}
export const POST: APIRoute = async ({ request }) => {
  try {
    await verifyAdminToken(request); // 验证Admin Token
    const { name, email, password, role } = await request.json(); // 解析请求体

    // 输入验证
    if (!name || !email || !password || !role) {
      return new Response(JSON.stringify({ error: 'Missing required fields: name, email, password, role' }), { status: 400 });
    }

    // 检查用户是否存在（例如，按email）
    const existingUser = await db.select().from(users).where(eq(users.email, email));
    if (existingUser.length > 0) {
      return new Response(JSON.stringify({ error: 'User with this email already exists' }), { status: 409 }); // 冲突
    }

    // 哈希密码
    const hashedPassword = await bcrypt.hash(password, 16);

    // 创建新用户
    const [newUser] = await db.insert(users).values({
      email: email,
      passwordHash: hashedPassword, // 存储哈希后的密码
      name: name,
      role: role,
    }).returning({ id: users.id }); // 返回新ID

    return new Response(JSON.stringify({ success: true, userId: newUser.id }), { status: 201 }); // 201 Created
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500 });
  }
};

export const PUT: APIRoute = async ({ request, params }) => {
  try {
    await verifyAdminToken(request);
    const { id } = params
    const body = await request.json(); // e.g., { id: number, role: string }
    if (!id) {
      return new Response(JSON.stringify({ error: 'User ID is required' }), { status: 400 });
    }

    // 输入验证：至少有一个字段需要更新
    if (Object.keys(body).length === 0) {
      return new Response(JSON.stringify({ error: 'No fields to update' }), { status: 400 });
    }

    // 如果更新密码，需哈希
    if (body.password) {
      body.passwordHash = await bcrypt.hash(body.password, 16);
    }

    // 检查用户是否存在
    const existingUser = await db.select().from(users).where(eq(users.id, id));
    if (existingUser.length === 0) {
      return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
    }
    // 过滤不更新的字段
    Object.keys(body).forEach(key => {
      if (['createdAt', 'id', 'updatedAt', 'password'].includes(key)) delete body[key]
    })
    await db.update(users).set(body).where(eq(users.id, id));
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500 });
  }
}


export const DELETE: APIRoute = async ({ request, params }) => {
  try {
    await verifyAdminToken(request); // 验证Admin Token
    const { id } = params
    if (!id) {
      return new Response(JSON.stringify({ error: 'User ID is required' }), { status: 400 });
    }

    // 检查用户是否存在
    const existingUser = await db.select().from(users).where(eq(users.id, id));
    if (existingUser.length === 0) {
      return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
    }

    // 执行删除
    await db.delete(users).where(eq(users.id, id));

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500 });
  }
}

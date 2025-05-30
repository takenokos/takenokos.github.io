import { eq, ilike, gt } from 'drizzle-orm';
import { db, products, } from '@db/schema';
import { verifyAdminToken } from './JWT';
import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ request }) => {
  try {
    await verifyAdminToken(request);
    const url = new URL(request.url);
    const search = url.searchParams.get('search') || '';
    const categoryId = url.searchParams.get('categoryId') || '';
    const stock = url.searchParams.get('stock') ? Number(url.searchParams.get('stock')) : 0;
    const limit = url.searchParams.get('limit') ? Number(url.searchParams.get('limit')) : 10;
    const offset = url.searchParams.get('offset') ? Number(url.searchParams.get('offset')) : 0;

    let query = db.select().from(products).$dynamic();

    if (search) {
      query = query.where(ilike(products.name, `%${search}%`)); // 模糊搜索
    }
    if (categoryId) {
      query = query.where(eq(products.categoryId, categoryId));
    }
    if (stock > 0) {
      query = query.where(gt(products.stock, stock)); // 例如，stock大于指定值
    }

    const result = await query.limit(limit).offset(offset); // 分页
    return new Response(JSON.stringify(result), { status: 200 });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 401 });
  }
};

import { verifyAdminToken } from './JWT';
import type { APIRoute } from 'astro';

const menuData = [ // 示例静态菜单数据，实际可从数据库查询
  { id: '1', label: 'Dashboard', icon: 'mdi:home', href: '/admin/dashboard', roles: ['admin'] },
  { id: '2', label: 'User Management', icon: 'mdi:users-outline', href: '/admin/users', roles: ['admin'] },
  {
    id: '3', label: 'Product Management', icon: 'mdi:box-variant-closed', href: '/admin/products', roles: ['admin'], subItems: [
      { id: '3.1', label: 'Add Product', href: '/admin/product/add' },
    ]
  },
];

export const GET: APIRoute = async ({ request }) => {
  try {
    const { role } = await verifyAdminToken(request);
    const filteredMenu = menuData.filter(item => item.roles.includes(role));
    return new Response(JSON.stringify({ menu: filteredMenu }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 401 });
  }
}

import { verifyAdminToken } from "./JWT";
import type { APIRoute } from "astro";
import { jsonResponse, responseFromError } from "@/utils/apiResponse";

const menuData = [
  // 示例静态菜单数据，实际可从数据库查询
  {
    id: "1",
    label: "Dashboard",
    icon: "mdi:home",
    href: "/admin/dashboard",
    roles: ["admin"],
  },
  {
    id: "2",
    label: "User Management",
    icon: "mdi:users-outline",
    href: "/admin/users",
    roles: ["admin"],
  },
  {
    id: "3",
    label: "Product Management",
    icon: "mdi:box-variant-closed",
    href: "/admin/products",
    roles: ["admin"],
    subItems: [
      { id: "3.1", label: "Category", href: "/admin/categories" },
      { id: "3.2", label: "Add Product", href: "/admin/product/add" },
    ],
  },
  {
    id: "4",
    label: "Content Operations",
    icon: "mdi:comment-text-outline",
    href: "/admin/comments",
    roles: ["admin"],
    subItems: [
      { id: "4.1", label: "Comments", href: "/admin/comments" },
      { id: "4.2", label: "Contact Messages", href: "/admin/contact-messages" },
      { id: "4.3", label: "Subscribers", href: "/admin/subscribers" },
    ],
  },
];

export const GET: APIRoute = async ({ request }) => {
  try {
    const { role } = await verifyAdminToken(request);
    const filteredMenu = menuData.filter((item) => item.roles.includes(role));
    return jsonResponse({ menu: filteredMenu });
  } catch (error) {
    return responseFromError(error);
  }
};

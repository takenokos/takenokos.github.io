import { useEffect, useState } from "preact/hooks";
import "@/utils/iconify";
import { Icon } from "@iconify-icon/react";
import { getRole, getToken, request } from "@/utils/jwt.ts";

interface DashboardStats {
  products: number;
  categories: number;
  pendingContacts: number;
  activeSubscribers: number;
  comments: number;
  admins: number;
}

interface DashboardItem {
  id: string;
  createdAt?: string;
}

interface ContactItem extends DashboardItem {
  name: string;
  email: string;
  status: string;
}

interface CommentItem extends DashboardItem {
  postId: string;
  commentText: string;
}

interface DashboardResponse {
  data: {
    stats: DashboardStats;
    latestContacts: ContactItem[];
    latestComments: CommentItem[];
  };
}

const statCards = [
  {
    key: "products",
    label: "Products",
    icon: "mdi:box-variant-closed",
    href: "/admin/products",
  },
  {
    key: "categories",
    label: "Categories",
    icon: "mdi:shape-outline",
    href: "/admin/categories",
  },
  {
    key: "pendingContacts",
    label: "Pending Messages",
    icon: "mdi:email-alert-outline",
    href: "/admin/contact-messages",
  },
  {
    key: "activeSubscribers",
    label: "Subscribers",
    icon: "mdi:account-check-outline",
    href: "/admin/subscribers",
  },
  {
    key: "comments",
    label: "Comments",
    icon: "mdi:comment-text-outline",
    href: "/admin/comments",
  },
  {
    key: "admins",
    label: "Admins",
    icon: "mdi:shield-account-outline",
    href: "/admin/users",
  },
] as const;

const quickActions = [
  {
    label: "Add product",
    href: "/admin/product/add",
    icon: "mdi:plus-box-outline",
  },
  {
    label: "Review messages",
    href: "/admin/contact-messages",
    icon: "mdi:email-fast-outline",
  },
  {
    label: "Manage comments",
    href: "/admin/comments",
    icon: "mdi:comment-edit-outline",
  },
];

export default function Dashboard() {
  const token = getToken();
  const role = getRole();
  const [data, setData] = useState<DashboardResponse["data"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        const res = await request<DashboardResponse>("/api/admin/dashboard");
        if (res) setData(res.data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load dashboard",
        );
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (!token || role !== "admin") {
    return <div>Access Denied</div>;
  }

  if (loading) return <p>Loading dashboard...</p>;

  if (error) return <p class="text-red-600">{error}</p>;

  if (!data) return <p>No dashboard data available.</p>;

  return (
    <div class="space-y-6">
      <section class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {statCards.map((card) => (
          <a
            key={card.key}
            href={card.href}
            class="block border border-slate-200 dark:border-slate-700 rounded-md bg-white/70 dark:bg-slate-800/70 p-4 hover:border-indigo-400 transition-colors"
          >
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-slate-500 dark:text-slate-400">
                  {card.label}
                </p>
                <p class="mt-2 text-3xl font-semibold">
                  {data.stats[card.key]}
                </p>
              </div>
              <Icon class="text-3xl text-indigo-500" icon={card.icon} />
            </div>
          </a>
        ))}
      </section>

      <section class="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div class="xl:col-span-2 border border-slate-200 dark:border-slate-700 rounded-md bg-white/70 dark:bg-slate-800/70">
          <header class="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
            <h2 class="text-lg font-semibold">Latest Contact Messages</h2>
            <a href="/admin/contact-messages" class="text-sm text-indigo-600">
              View all
            </a>
          </header>
          <div class="divide-y divide-slate-200 dark:divide-slate-700">
            {data.latestContacts.length === 0 ? (
              <p class="p-4 text-slate-500">No contact messages.</p>
            ) : (
              data.latestContacts.map((message) => (
                <div key={message.id} class="p-4 flex items-start gap-3">
                  <Icon
                    class="mt-1 text-xl text-indigo-500"
                    icon="mdi:email-outline"
                  />
                  <div class="min-w-0 flex-1">
                    <div class="flex items-center justify-between gap-3">
                      <p class="font-medium truncate">{message.name}</p>
                      <span class="text-xs px-2 py-1 rounded bg-slate-100 dark:bg-slate-700">
                        {message.status}
                      </span>
                    </div>
                    <p class="text-sm text-slate-500 truncate">
                      {message.email}
                    </p>
                    {message.createdAt && (
                      <p class="mt-1 text-xs text-slate-400">
                        {new Date(message.createdAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div class="space-y-4">
          <section class="border border-slate-200 dark:border-slate-700 rounded-md bg-white/70 dark:bg-slate-800/70">
            <header class="p-4 border-b border-slate-200 dark:border-slate-700">
              <h2 class="text-lg font-semibold">Quick Actions</h2>
            </header>
            <div class="p-3 space-y-2">
              {quickActions.map((action) => (
                <a
                  key={action.href}
                  href={action.href}
                  class="flex items-center gap-2 p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  <Icon class="text-xl text-indigo-500" icon={action.icon} />
                  <span>{action.label}</span>
                </a>
              ))}
            </div>
          </section>

          <section class="border border-slate-200 dark:border-slate-700 rounded-md bg-white/70 dark:bg-slate-800/70">
            <header class="p-4 border-b border-slate-200 dark:border-slate-700">
              <h2 class="text-lg font-semibold">Latest Comments</h2>
            </header>
            <div class="divide-y divide-slate-200 dark:divide-slate-700">
              {data.latestComments.length === 0 ? (
                <p class="p-4 text-slate-500">No comments.</p>
              ) : (
                data.latestComments.map((comment) => (
                  <div key={comment.id} class="p-4">
                    <p class="text-sm line-clamp-2">{comment.commentText}</p>
                    <p class="mt-1 text-xs text-slate-500">{comment.postId}</p>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}

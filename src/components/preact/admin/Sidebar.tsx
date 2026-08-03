import { useRef, useState, useEffect } from "preact/hooks";
import { getToken } from "@/utils/jwt.ts";
import "@/utils/iconify";
import { Icon } from "@iconify-icon/react";
import { navigate } from "astro:transitions/client";

import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownMenuItem,
} from "../ui/Dropdown.tsx";

interface MenuItem {
  id: string;
  label: string;
  icon?: string; // e.g., 'home' for icons
  href?: string;
  subItems?: MenuItem[];
}

export default function Sidebar() {
  const sidebarRef = useRef<HTMLElement>(null);
  const storeOpen = localStorage.getItem("sidebarOpen");
  const [isOpen, setIsOpen] = useState(storeOpen ? storeOpen === "true" : true);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    async function fetchMenu() {
      try {
        const token = getToken();

        const response = await fetch("/api/admin/menu", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (response.ok) {
          setMenuItems(data.menu); // 假设API返回过滤后的菜单项
        } else {
          console.error("Failed to fetch menu");
        }
      } catch (error) {
        console.error("Error fetching menu:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchMenu();
  }, []);

  useEffect(() => {
    localStorage.setItem("sidebarOpen", String(isOpen));
    sidebarRef.current?.style.removeProperty("width");
  }, [isOpen]);

  useEffect(() => {
    const updateCurrentPath = () => setCurrentPath(window.location.pathname);

    document.addEventListener("astro:page-load", updateCurrentPath);
    window.addEventListener("popstate", updateCurrentPath);

    return () => {
      document.removeEventListener("astro:page-load", updateCurrentPath);
      window.removeEventListener("popstate", updateCurrentPath);
    };
  }, []);

  const normalizePath = (path?: string) => {
    if (!path) return "";
    return path.length > 1 ? path.replace(/\/$/, "") : path;
  };

  const isHrefActive = (href?: string) => {
    const normalizedHref = normalizePath(href);
    const normalizedCurrent = normalizePath(currentPath);
    if (!normalizedHref) return false;
    return (
      normalizedCurrent === normalizedHref ||
      normalizedCurrent.startsWith(`${normalizedHref}/`)
    );
  };

  const isItemActive = (item: MenuItem) => {
    if (isHrefActive(item.href)) return true;
    if (
      item.href === "/admin/products" &&
      currentPath.startsWith("/admin/product")
    ) {
      return true;
    }
    return (
      item.subItems?.some((subItem) => isHrefActive(subItem.href)) || false
    );
  };

  const linkClass = (active: boolean, collapsed = false) =>
    [
      collapsed ? "inline-flex items-center" : "flex items-center",
      "p-2 rounded transition-colors",
      active
        ? "bg-indigo-500 text-white"
        : "hover:bg-slate-500/30 dark:hover:bg-slate-900/40",
    ].join(" ");

  const toggleOpen = () => {
    setIsOpen((current) => !current);
  };

  return (
    <aside
      ref={sidebarRef}
      class={`sidebar flex h-screen shrink-0 flex-col overflow-hidden bg-slate-300 dark:bg-slate-700 ${isOpen ? "w-60" : "w-10"} transition-[width] duration-300 ease-in-out`}
    >
      <div class="flex h-16 shrink-0 items-center overflow-hidden px-4">
        {isOpen && (
          <h2 class="truncate text-2xl font-bold leading-none">Admin Menu</h2>
        )}
      </div>
      <nav class="admin-scrollbar min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-1 pb-2">
        {loading ? (
          <div class="p-2 text-sm text-slate-600 dark:text-slate-300">
            Loading...
          </div>
        ) : isOpen ? (
          <ul>
            {menuItems.map((item) => (
              <li key={item.id} class="m-1 overflow-hidden text-nowrap">
                <a
                  href={item.href}
                  class={linkClass(isItemActive(item))}
                  aria-current={isItemActive(item) ? "page" : undefined}
                  title={item.label}
                >
                  {item.icon && (
                    <Icon class="mr-1 text-2xl" icon={item.icon} />
                  )}{" "}
                  {item.label}
                </a>
                {item.subItems && item.subItems.length > 0 && (
                  <ul class="ml-7">
                    {item.subItems.map((subItem) => (
                      <li key={subItem.id} class="my-1">
                        <a
                          href={subItem.href}
                          class={linkClass(isHrefActive(subItem.href))}
                          aria-current={
                            isHrefActive(subItem.href) ? "page" : undefined
                          }
                        >
                          {subItem.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <ul>
            {menuItems.map((item) => (
              <li key={item.id}>
                {item.subItems && item.subItems.length > 0 ? (
                  <Dropdown triggerType="hover">
                    <DropdownTrigger>
                      <a
                        href={item.href}
                        class={linkClass(isItemActive(item), true)}
                        aria-current={isItemActive(item) ? "page" : undefined}
                        title={item.label}
                      >
                        {item.icon && (
                          <Icon class="text-2xl" icon={item.icon} />
                        )}
                      </a>
                    </DropdownTrigger>
                    <DropdownMenu position="right">
                      {item.subItems.map((subItem) => (
                        <DropdownMenuItem
                          class={linkClass(isHrefActive(subItem.href))}
                          value={subItem.href as string}
                          onSelect={(val: string | number) =>
                            navigate(String(val))
                          }
                        >
                          {subItem.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenu>
                  </Dropdown>
                ) : (
                  <a
                    href={item.href}
                    class={linkClass(isItemActive(item), true)}
                    aria-current={isItemActive(item) ? "page" : undefined}
                    title={item.label}
                  >
                    {item.icon && <Icon class="text-2xl" icon={item.icon} />}
                  </a>
                )}
              </li>
            ))}
          </ul>
        )}
      </nav>
      <div class="shrink-0 text-right">
        <button
          class="m-1 inline-flex cursor-pointer items-center rounded bg-transparent p-2 hover:bg-slate-100/50 dark:hover:bg-slate-900/50"
          onClick={() => toggleOpen()}
          type="button"
          aria-label={isOpen ? "Collapse admin menu" : "Expand admin menu"}
        >
          <Icon
            class={`toggle-icon h-5 w-5 text-xl transition-transform duration-300 ${!isOpen && "rotate-180"}`}
            icon="line-md:chevron-double-left"
          />
        </button>
      </div>
    </aside>
  );
}

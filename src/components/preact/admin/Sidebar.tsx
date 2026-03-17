import { useState, useEffect } from 'preact/hooks';
import { getToken } from '@/utils/jwt.ts'
import { Icon } from '@iconify-icon/react';
import { gsap } from 'gsap'

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
  const storeOpen = localStorage.getItem('sidebarOpen')
  const [isOpen, setIsOpen] = useState(storeOpen ? storeOpen === 'true' : true)
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchMenu() {
      try {
        const token = getToken()

        const response = await fetch('/api/admin/menu', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (response.ok) {
          setMenuItems(data.menu); // 假设API返回过滤后的菜单项
        } else {
          console.error('Failed to fetch menu');
        }
      } catch (error) {
        console.error('Error fetching menu:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchMenu();
  }, []);

  useEffect(() => {
    localStorage.setItem('sidebarOpen', String(isOpen))
  }, [isOpen])
  const toggleOpen = () => {
    gsap.fromTo('.toggle-icon', { rotate: isOpen ? 0 : 180 }, {
      rotate: isOpen ? 180 : 360, duration: 0.5
    })
    gsap.fromTo('.sidebar', { width: isOpen ? '15rem' : '2.5rem', ease: 'none' }, {
      width: isOpen ? '2.5rem' : '15rem', duration: 0.5, ease: 'none', onComplete: () => {
        if (!isOpen)
          setIsOpen(!isOpen)
        else {
          setTimeout(() => {
            setIsOpen(!isOpen)
          }, 500)
        }
      }
    })
  }
  if (loading) return <div>Loading...</div>;

  return (
    <aside class={`sidebar flex flex-col justify-between inset-y-0 bg-slate-300 dark:bg-slate-700 ${isOpen ? 'w-60' : 'w-10'} transition-all duration-500`}>
      <h2 class="text-2xl font-bold my-4 mx-8 text-nowrap overflow-hidden">Admin Menu</h2>
      {loading ? <div>Loading...</div> :
        isOpen ? (<ul class="flex-1">
          {menuItems.map((item) => (
            <li key={item.id} class="overflow-hidden text-nowrap">
              <a href={item.href} class="flex items-center p-2 hover:bg-slate-500 rounded" title={item.label}>
                {item.icon && <Icon class="text-2xl mr-1" icon={item.icon} />} {item.label}
              </a>
              {item.subItems && item.subItems.length > 0 && (
                <ul class="ml-7" >
                  {
                    item.subItems.map((subItem) => (
                      <li key={subItem.id}>
                        <a href={subItem.href} class="flex items-center p-2 hover:bg-slate-500 rounded">
                          {subItem.label}
                        </a>
                      </li>
                    ))
                  }
                </ul>
              )}
            </li>
          ))}
        </ul>
        ) : (
          <ul class="flex-1">
            {menuItems.map((item) => (
              <li key={item.id}>
                {item.subItems && item.subItems.length > 0 ? (
                  <Dropdown triggerType='hover'>
                    <DropdownTrigger>
                      <a href={item.href} class="inline-flex items-center p-2 hover:bg-slate-500 rounded" title={item.label}>
                        {item.icon && <Icon class="text-2xl" icon={item.icon} />}
                      </a>
                    </DropdownTrigger>
                    <DropdownMenu position='right'>
                      {
                        item.subItems.map((subItem) => (
                          <DropdownMenuItem class="flex items-center p-2 py-2 hover:bg-slate-500 rounded" value={subItem.href as string} onSelect={(val: string | number) => window.location.href = (val as string)}>
                            {subItem.label}
                          </DropdownMenuItem>
                        ))
                      }
                    </DropdownMenu>
                  </Dropdown>
                ) : (
                  <a href={item.href} class="inline-flex items-center p-2 hover:bg-slate-500 rounded" title={item.label}>
                    {item.icon && <Icon class="text-2xl" icon={item.icon} />}
                  </a>
                )}
              </li>
            ))}
          </ul>
        )
      }
      <div class="text-right">
        <button class="p-2 m-1 inline-flex items-center cursor-pointer rounded bg-transparent hover:bg-slate-100/50 dark:hover:bg-slate-900/50" onClick={() => toggleOpen()}>
          <Icon class={`toggle-icon ${!isOpen && 'rotate-180'}`} icon="line-md:chevron-double-left" />
        </button>
      </div>
    </aside >
  );
};

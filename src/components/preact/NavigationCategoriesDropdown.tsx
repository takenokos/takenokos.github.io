import type { Category } from "@/db/schema.d";
import "@/utils/iconify";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownMenuItem,
} from "./ui/Dropdown.tsx";
import { Icon } from "@iconify-icon/react";
interface NavigationCategoriesDropdownProps {
  categories?: Category[];
}
export default function NavigationCategoriesDropdown({
  categories = [],
}: NavigationCategoriesDropdownProps) {
  return (
    <Dropdown
      triggerType="hover"
      class="lg:inline-block uppercase font-semibold after:content-[''] after:block after:h-1 after:bg-transparent after:transition after:duration-300 after:-translate-x-full hover:after:translate-x-0 hover:after:bg-indigo-500/70 focus:after:translate-x-0 focus:after:bg-indigo-500/50"
    >
      <DropdownTrigger class="flex items-center gap-0.5 uppercase">
        <a href="/products/all">Category</a>
        <Icon class="text-lg" icon="line-md:chevron-down" />
      </DropdownTrigger>
      <DropdownMenu>
        {categories.map((category) => (
          <DropdownMenuItem
            class="flex items-center p-2 py-2 rounded hover:bg-indigo-500/30 hover:text-indigo-500"
            value={category.id as string}
            onSelect={(val: string | number) =>
              (window.location.href = ("/products/" + category.name) as string)
            }
          >
            {category.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  );
}

import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownMenuItem,
} from "./Dropdown.tsx";
import { signOut } from "auth-astro/client";
export default function HeaderUserDropdown({ username }: { username?: string | null }) {
  const handleSelect = (val: string | number) => {
    switch (val) {
      case 'logout':
        signOut()
        break
      default:
        console.log(val)
    }
  };
  return (
    <Dropdown >
      <DropdownTrigger>
        Welcome {username}
      </DropdownTrigger>
      <DropdownMenu>
        <DropdownMenuItem class="text-red-500 bg-red-500/40 hover:bg-red-500/30" value="logout" onSelect={handleSelect}>
          Logout
        </DropdownMenuItem>
      </DropdownMenu>
    </Dropdown>
  )
}

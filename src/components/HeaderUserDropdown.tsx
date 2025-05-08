import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownMenuItem,
} from "./Dropdown.tsx";
import { signOut } from "auth-astro/client";
export default function HeaderUserDropdown({ session }: any) {
  const handleSelect = (val: any) => {
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
      <DropdownTrigger >
        Welcome {session.user?.name}
      </DropdownTrigger>
      <DropdownMenu >
        <DropdownMenuItem class="text-red-500 bg-red-500/40 hover:bg-red-500/30" value="logout" onSelect={handleSelect}>
          Logout
        </DropdownMenuItem>
      </DropdownMenu>
    </Dropdown>

  )
}

import { useState, useEffect } from 'preact/hooks';
import { cloneElement } from 'preact';
import type { ComponentChildren, JSX } from 'preact';

interface DropdownProps {
  children: ComponentChildren;
}

interface DropdownTriggerProps {
  children: ComponentChildren;
  open?: boolean;
  setOpen?: (open: boolean) => void;
}

interface DropdownMenuProps {
  children: ComponentChildren;
  open?: boolean;
}

interface DropdownMenuItemProps {
  children: ComponentChildren;
  value: string | number;
  onSelect?: (value: string | number) => void;
  setOpen?: (open: boolean) => void;
}

export function Dropdown({ children }: DropdownProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      const target = e.target as HTMLElement | null;
      if (!target?.closest('.dropdown-root')) {
        setOpen(false);
      }
    }
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  // 给子组件传递 open 状态和切换函数
  const childrenWithProps = Array.isArray(children)
    ? children.map(child => cloneElement(child as JSX.Element, { open, setOpen }))
    : cloneElement(children as JSX.Element, { open, setOpen });

  return (
    <div class="dropdown-root relative inline-block">
      {childrenWithProps}
    </div>
  );
}

export function DropdownTrigger({ children, open, setOpen }: DropdownTriggerProps) {
  return (
    <button
      type="button"
      aria-haspopup="menu"
      aria-expanded={open}
      onClick={e => {
        e.stopPropagation();
        setOpen && setOpen(!open);
      }}
    >
      {children}
    </button>
  );
}

export function DropdownMenu({ children, open }: DropdownMenuProps) {
  if (!open) return null;
  return (
    <ul
      role="menu"
      class="absolute top-full left-0 m-0 py-0.5 px-0 list-none shadow z-50 min-w-36 border rounded-md bg-slate-50 dark:bg-slate-950"
    >
      {children}
    </ul>
  );
}

export function DropdownMenuItem({ children, value, onSelect, setOpen }: DropdownMenuItemProps) {
  return (
    <li
      role="menuitem"
      tabIndex={-1}
      class="cursor-pointer px-1 py-0.5"
      onClick={() => {
        if (onSelect) onSelect(value);
        setOpen && setOpen(false);
      }}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (onSelect) onSelect(value);
          setOpen && setOpen(false);
        }
      }}
    >
      {children}
    </li>
  );
}

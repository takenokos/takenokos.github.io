import { useState, useEffect } from 'preact/hooks';
import { cloneElement } from 'preact';
import type { ComponentChildren, JSX } from 'preact';

interface DropdownProps {
  children: ComponentChildren;
  triggerType?: 'hover' | 'click'
}

interface DropdownTriggerProps {
  children: ComponentChildren;
  open?: boolean;
  setOpen?: (open: boolean) => void;
  triggerType?: 'hover' | 'click'
}

interface DropdownMenuProps {
  children: ComponentChildren;
  open?: boolean;
  position?: 'left' | 'right' | 'top' | 'bottom',
  triggerType?: 'hover' | 'click'
}

interface DropdownMenuItemProps {
  children: ComponentChildren;
  value: string | number;
  onSelect?: (value: string | number) => void;
  setOpen?: (open: boolean) => void;
  class?: string
}

export function Dropdown({ children, triggerType='click' }: DropdownProps) {
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
    ? children.map(child => cloneElement(child as JSX.Element, { open, setOpen, triggerType }))
    : cloneElement(children as JSX.Element, { open, setOpen, triggerType });

  return (
    <div class="dropdown-root relative inline-block"
      onMouseEnter={e => {
        e.stopPropagation();
        if (triggerType !== 'hover') return
        setOpen && setOpen(true);
      }}
      onMouseLeave={e => {
        e.stopPropagation();
        if (triggerType !== 'hover') return
        setOpen && setOpen(false);
      }}
    >
      {childrenWithProps}
    </div>
  );
}

export function DropdownTrigger({ children, open, setOpen, triggerType }: DropdownTriggerProps) {
  return (
    <button
      class="cursor-pointer"
      type="button"
      aria-haspopup="menu"
      aria-expanded={open}
      onClick={e => {
        e.stopPropagation();
        if (triggerType !== 'click') return
        setOpen && setOpen(!open);
      }}
    >
      {children}
    </button>
  );
}

export function DropdownMenu({ children, open, position }: DropdownMenuProps) {
  const [visible, setVisible] = useState(false)
  const ulAnimationEnd = () => {
    setVisible(!!open)
  }
  if (!open && !visible) return null
  let positionClass = "top-full left-0"
  switch (position) {
    case 'left':
      positionClass = "top-0 right-full"
      break
    case 'right':
      positionClass = "top-0 left-full"
      break
    case 'top':
      positionClass = "bottom-full left-0"
      break
    case 'bottom':
      positionClass = "top-full left-0"
      break
  }
  return (
    <ul
      role="menu"
      class={`absolute ${positionClass} m-0 p-0 list-none ring ring-slate-950/20 dark:ring-slate-50/20 z-50 min-w-36 rounded-md bg-slate-50 dark:bg-slate-950 overflow-hidden motion-duration-150 ${open ? 'motion-opacity-in motion-translate-x-in motion-translate-y-in' : 'motion-opacity-out motion-translate-x-out motion-translate-y-out'}`}
      onAnimationEnd={ulAnimationEnd}
    >
      {children}
    </ul>
  )
}

export function DropdownMenuItem({ children, value, onSelect, setOpen, class: className }: DropdownMenuItemProps) {
  return (
    <li
      role="menuitem"
      tabIndex={-1}
      class={["cursor-pointer px-2 py-0.5", className].join(' ')}
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

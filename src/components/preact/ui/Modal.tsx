import { Icon } from '@iconify-icon/react';
import type { ComponentChildren } from 'preact';
import { useRef } from 'preact/hooks';
import gsap from 'gsap';
interface ModalProps {
  children: ComponentChildren;
  onClose: () => void
}
export default function Modal({ children, onClose }: ModalProps) {
  const modalRef = useRef(null); // 用于引用Modal容器元素  handleCloseWithAnimation 
  const handleCloseWithAnimation = () => {
    if (modalRef.current) {
      gsap.to(modalRef.current, {
        opacity: 0,
        scale: 0.8,
        y: -50,
        duration: 0.5,
        ease: 'power3.in',
        onComplete: onClose  // 动画完成后调用onClose
      });
    } else {
      onClose();  // 如果元素不存在，直接关闭
    }
  };
  return (
    <div class="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 motion-opacity-in">
      <div ref={modalRef} class="relative bg-white dark:bg-slate-800 p-8 rounded shadow-lg motion-scale-in motion-opacity-in -motion-translate-y-in-50">
        <button class="absolute right-2 top-2 cursor-pointer rounded-full transition hover:bg-slate-500/50 inline-flex items-center justify-center p-0.5" onClick={() => handleCloseWithAnimation()}>
          <Icon icon="line-md:close" />
        </button>
        {children}
      </div>
    </div>
  );
}

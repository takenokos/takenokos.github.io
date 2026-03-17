
import { useState, useRef } from 'preact/hooks';
import { gsap } from 'gsap';

// Define interfaces for type safety
interface FAQItem {
  question: string;
  answer: string;
}

interface FAQComponentProps {
  faqData: FAQItem[];
  accordion?: boolean;
  class?: string;
  itemClass?: string;
  triggerClass?: string;
}

export default function FAQComponent({ faqData, accordion, class: className, itemClass, triggerClass }: FAQComponentProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [openSet, setOpenSet] = useState<Set<number>>(new Set());

  const toggleFAQ = (index: number) => {
    if (accordion) {
      // 手风琴模式：如果点击的就是当前展开的，关闭它，否则展开点击的
      setOpenIndex((prev) => (prev === index ? null : index));
    } else {
      // 多开模式：用 Set 来保存多个展开项
      setOpenSet((prevSet) => {
        const newSet = new Set(prevSet);
        if (newSet.has(index)) {
          newSet.delete(index);
        } else {
          newSet.add(index);
        }
        return newSet;
      });
    }
  };

  return (
    <div class={['space-y-4', className].join(' ')}>
      {faqData.map((item, index) => {
        const answerRef = useRef<HTMLDivElement>(null);
        const isOpen = accordion ? openIndex === index : openSet.has(index);
        if (answerRef.current) {
          if (isOpen) {
            gsap.to(answerRef.current, {
              opacity: 1,
              height: 'auto',
              duration: 0.5,
              ease: 'power3.out'
            });
          } else {
            gsap.to(answerRef.current, {
              opacity: 0,
              height: 0,
              duration: 0.5,
              ease: 'power3.out'
            });
          }
        }

        return (
          <div key={index} class={["overflow-hidden", itemClass].join(' ')}>
            <button
              onClick={() => toggleFAQ(index)}
              class={["cursor-pointer w-full text-left p-4 flex justify-between items-center", triggerClass].join(' ')}
            >
              <span class="font-medium">{item.question}</span>
              <span>{isOpen ? '-' : '+'}</span>
            </button>
            <div
              ref={answerRef} class="h-0 opacity-0 overflow-hidden"
            >
              <p class="p-4">{item.answer}</p>
            </div>
          </div>
        )
      })}
    </div>
  );
};

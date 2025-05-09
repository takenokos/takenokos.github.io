
import { useState, useRef } from 'preact/hooks';
import { gsap } from 'gsap';

// Define interfaces for type safety
interface FAQItem {
  question: string;
  answer: string;
}

interface FAQComponentProps {
  faqData: FAQItem[];  // Array of FAQ items
}

export default function FAQComponent({ faqData }: FAQComponentProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);  // State with type for index

  const toggleFAQ = (index: number) => {
    setOpenIndex((prevIndex) => (prevIndex === index ? null : index));  // Improved toggle logic
  };

  return (
    <div class="space-y-4">
      {faqData.map((item, index) => {
        const answerRef = useRef<HTMLDivElement>(null);  // Typed ref for the answer div
        if (openIndex === index && answerRef.current) {
          gsap.to(answerRef.current, {
            opacity: 1,
            height:'auto',
            duration: 0.5,
            ease: 'power3.out'
          });
        }else{
          gsap.to(answerRef.current, {
            opacity: 0,
            height:0,
            duration: 0.5,
            ease: 'power3.out'
          });
          
        }

        return (
          <div key={index} class="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleFAQ(index)}
              class="cursor-pointer w-full text-left p-4 flex justify-between items-center bg-slate-100 dark:bg-slate-700 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            >
              <span class="font-medium">{item.question}</span>
              <span>{openIndex === index ? '-' : '+'}</span>
            </button>
            <div
              ref={answerRef} class="h-0 opacity-0 overflow-hidden"
            >
              <p class="p-4 text-slate-700 dark:text-slate-300">{item.answer}</p>
            </div>
          </div>
        )
      })}
    </div>
  );
};

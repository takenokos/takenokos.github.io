import { useEffect, useState } from "preact/hooks";
import { render } from "preact";
import { gsap } from "gsap"; // GSAP for animations
import { uniqueKey } from "@/utils/uniqueKey";
interface LoadingProgressBarProps {
  visible: boolean;
}
export default function LoadingProgressBar({
  visible,
}: LoadingProgressBarProps) {
  const [complete, setComplete] = useState(false); // Get isLoading from context
  useEffect(() => {
    setComplete(false);
    if (visible) {
      // Animate the progress bar when loading starts
      gsap.to(".loading-progress-bar", {
        opacity: 1,
        duration: 0.1,
        onComplete: () => {
          gsap.fromTo(
            ".loading-progress-bar-fill",
            { width: "0%" },
            {
              width: "80%",
              duration: 1.5,
              ease: "power2.inOut",
              onComplete: () => {
                setComplete(true);
              },
            },
          );
        },
      });
    } else {
      // Reset animation when loading ends
      gsap.to(".loading-progress-bar-fill", {
        width: "100%",
        duration: 0.5,
        onComplete: () => {
          gsap.to(".loading-progress-bar", {
            opacity: 0,
            duration: 0.1,
            onComplete: () => {
              setComplete(true);
            },
          });
        },
      });
    }
  }, [visible]); // Re-run on isLoading change
  if (!visible && complete) return;
  return (
    <div class="loading-progress-bar fixed top-0 z-50 w-full bg-slate-100/20 dark:bg-slate-900/20 rounded-full h-2.5">
      <div
        class="loading-progress-bar-fill bg-indigo-500 h-2.5 rounded-full"
        style={{ width: "0%" }} // Initial width for animation
      ></div>
    </div>
  );
}

const loadingStateMap = new Map();

const setIsLoading = (key: string, bol: boolean) => {
  loadingStateMap.set(key, bol);
  // const visible = Array.from(loadingStateMap.values()).some((val) => val);
  let visible = false;
  for (const value of loadingStateMap.values()) {
    if (value === true) {
      visible = true;
      break;
    }
  }
  console.log(loadingStateMap, visible);
  const className = "loading-progress-bar-container";
  let container = document.querySelector("." + className);
  if (!container) {
    container = document.createElement("div");
    container.classList = className;
    document.body.appendChild(container);
  }
  render(<LoadingProgressBar visible={visible} />, container);
};

export const useLoading = (bol: boolean = false) => {
  const key = uniqueKey();
  loadingStateMap.set(key, bol);
  return {
    setIsLoading: (bol: boolean) => setIsLoading(key, bol),
    removeIsLoading: () => {
      loadingStateMap.delete(key);
      console.log(loadingStateMap);
    },
  };
};

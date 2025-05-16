import { gsap } from "gsap";
import { useEffect } from "preact/hooks";
import type { GroupedPosts } from "./BlogContainer.tsx";

interface YearMonthMinimapProps {
  groupedPosts: GroupedPosts;
}


export default function YearMonthMinimap({ groupedPosts }: YearMonthMinimapProps) {
  useEffect(() => {
    async function loadPlugin() {
      const { ScrollToPlugin } = await import('gsap/ScrollToPlugin');
      gsap.registerPlugin(ScrollToPlugin);
    }
    loadPlugin();
  }, []); ``
  const handleJump = (sectionId: string) => {
    gsap.to(window, {
      duration: 0.5,
      scrollTo: { y: `#${sectionId}`, offsetY: 150 },
      ease: "power2.out",
    });
  };
  return (
    <ul class="space-y-2">
      {Object.keys(groupedPosts)
        .sort((a: string, b: string) => Number(b) - Number(a))
        .map((year: string) => (
          <li key={year}>
            <h4 class="font-medium">{year}</h4>
            <ul class="ml-4 space-y-1">
              {Object.keys(groupedPosts[year])
                .sort()
                .map((key: string) => (
                  <li key={key}>
                    <button
                      onClick={() => handleJump(key)}
                      class="text-indigo-500 hover:underline cursor-pointer"
                    >
                      {key.split("-")[2]} {year}
                    </button>
                  </li>
                ))}
            </ul>
          </li>
        ))}
    </ul>
  );
}

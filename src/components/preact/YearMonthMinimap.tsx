import { gsap } from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import type { GroupedPosts } from "./BlogContainer.tsx";

interface YearMonthMinimapProps {
  groupedPosts: GroupedPosts;
}

gsap.registerPlugin(ScrollToPlugin)

export default function YearMonthMinimap({ groupedPosts }: YearMonthMinimapProps) {

  const handleJump = (sectionId: string) => {
    gsap.to(window, {
      duration: 0.5,
      scrollTo: `#${sectionId}`,
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

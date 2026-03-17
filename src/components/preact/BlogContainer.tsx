import { useEffect, useState } from "preact/hooks";
import type { CollectionEntry } from "astro:content";
import { gsap } from 'gsap'
import { ScrollTrigger } from "gsap/src/ScrollTrigger";
import TagFilter from './TagFilter'
import YearMonthMinimap from "./YearMonthMinimap";

export type GroupedPosts = {
  [year: string]: {
    [key: string]: CollectionEntry<"blog">[];
  };
};
gsap.registerPlugin(ScrollTrigger)
interface BlogContainerProps {
  allPosts: CollectionEntry<'blog'>[]
}
export default function BlogContainer({ allPosts }: BlogContainerProps) {
  const groupPostsByYearMonth = (posts: CollectionEntry<"blog">[]): GroupedPosts => {
    const grouped: GroupedPosts = {};
    posts.sort(
      (a, b) =>
        new Date(b.data.pubDate).getTime() - new Date(a.data.pubDate).getTime(),
    );
    posts.forEach((post) => {
      const date = new Date(post.data.pubDate);
      const year = date.getFullYear().toString();
      const month = date.toLocaleString("default", { month: "long" });
      const key = `blog-${year}-${month}`;
      if (!grouped[year]) grouped[year] = {};
      if (!grouped[year][key]) grouped[year][key] = [];
      grouped[year][key].push(post);
    });
    return grouped;
  }

  const groupedPosts: GroupedPosts = groupPostsByYearMonth(allPosts);
  const allTags: string[] = [
    ...new Set(allPosts.flatMap((post) => post.data.tags || [])),
  ];
  const [selectedTags, setSelectTags] = useState<string[]>([]);

  useEffect(() => {
    gsap.from("section h2,section h3,section ul li", {
      opacity: 0,
      y: 20,
      duration: 0.5,
      stagger: 0.2,
      scrollTrigger: {
        trigger: "main",
        start: "top 80%",
      },
    });
  }, [])

  return (
    <div class="flex flex-col md:flex-row items-start">
      <aside
        class="w-full md:w-1/4 bg-slate-100/70 dark:bg-slate-800/70 p-4 rounded-lg shadow-mdmb-8 md:mb-0 md:mr-8 md:sticky md:top-36 md:self-start"
      >
        <h2 class="text-2xl font-semibold mb-4">Blog</h2>
        <h3 class="text-xl font-medium mb-2">Filter by Tags:</h3>
        <TagFilter
          tags={allTags}
          onFilterChange={(tags: string[]) => {
            setSelectTags(tags);
          }}
        />

        <h3 class="text-xl font-medium mb-2 mt-6">Overview</h3>
        <YearMonthMinimap groupedPosts={groupedPosts} />
      </aside>

      <section class="w-full">
        {
          Object.keys(groupedPosts)
            .sort((a: string, b: string) => Number(b) - Number(a))
            .map((year: string) => (
              <div id={`year-${year}`} class="mb-12">
                <h2 class="text-2xl font-bold mb-6">{year}</h2>
                {Object.keys(groupedPosts[year])
                  .sort()
                  .map((key: string) => (
                    <div id={key} class="mb-8">
                      <h3 class="text-xl font-medium mb-4">
                        {key.split("-")[2]} {year}
                      </h3>
                      <ul class="space-y-4">
                        {groupedPosts[year][key]
                          .filter(
                            (post: CollectionEntry<"blog">) =>
                              selectedTags.length === 0 ||
                              selectedTags.some((tag) =>
                                post.data.tags?.includes(tag),
                              ),
                          )
                          .map((post: CollectionEntry<"blog">) => (
                            <li class="bg-slate-50/70 dark:bg-slate-700/70 p-6 rounded-lg shadow-md">
                              <div class="flex justify-between">
                                <a href={`/posts/${post.id}`} class="hover:underline">
                                  {post.data.title}
                                </a>
                                <sup>{post.data.pubDate.toLocaleDateString()}</sup>
                              </div>
                              <div class="mt-2 flex flex-wrap gap-2">
                                {post.data.tags?.map((tag: string) => (
                                  <span class="text-sm bg-indigo-500 px-2 py-1 rounded">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </li>
                          ))}
                      </ul>
                    </div>
                  ))}
              </div>
            ))
        }
      </section>
    </div>
  )
}

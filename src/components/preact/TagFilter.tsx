import { useState, useEffect } from "preact/hooks";
interface TagFilterProps {
  tags: string[];
  onFilterChange: (selectedTags: string[]) => void;
}

export default function TagFilter({ tags, onFilterChange }: TagFilterProps) {
  const [selectedTagsInternal, setSelectedTagsInternal] = useState<
    string[]
  >([]);

  useEffect(() => {
    onFilterChange(selectedTagsInternal);
  }, [selectedTagsInternal]);

  return (
    <div class="flex flex-wrap gap-2">
      {tags.map((tag: string) => (
        <button
          onClick={() => {
            if (selectedTagsInternal.includes(tag)) {
              setSelectedTagsInternal(
                selectedTagsInternal.filter((t) => t !== tag),
              );
            } else {
              setSelectedTagsInternal([...selectedTagsInternal, tag]);
            }
          }}
          class={`cursor-pointer px-3 py-1 rounded text-sm hover:opacity-80 ${selectedTagsInternal.includes(tag) ? "bg-emerald-500 text-white" : "bg-slate-200 dark:bg-slate-700"}`}
        >
          {tag}
        </button>
      ))}
    </div>
  );
}

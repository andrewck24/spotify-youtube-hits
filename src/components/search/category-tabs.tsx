import { Button } from "@/components/ui/button";

export type Category = "all" | "artists" | "tracks";

interface SearchCategoryTabsProps {
  category: Category;
  setCategory: (category: Category) => void;
  artistCount: number;
  trackCount: number;
}

export function SearchCategoryTabs({
  category,
  setCategory,
  artistCount,
  trackCount,
}: SearchCategoryTabsProps) {
  if (artistCount === 0 && trackCount === 0) return null;

  return (
    <div className="flex gap-2">
      <Button
        variant={category === "all" ? "default" : "outline"}
        onClick={() => setCategory("all")}
      >
        全部
      </Button>
      <Button
        variant={category === "artists" ? "default" : "outline"}
        onClick={() => setCategory("artists")}
      >
        藝人 ({artistCount})
      </Button>
      <Button
        variant={category === "tracks" ? "default" : "outline"}
        onClick={() => setCategory("tracks")}
      >
        歌曲 ({trackCount})
      </Button>
    </div>
  );
}

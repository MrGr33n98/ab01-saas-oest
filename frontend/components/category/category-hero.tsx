import type { CategoryDetail } from "@/lib/categories";
import { CategoryHeroCarousel } from "./category-hero-carousel";

export function CategoryHero({ category }: { category: CategoryDetail }) {
  return <CategoryHeroCarousel category={category} />;
}

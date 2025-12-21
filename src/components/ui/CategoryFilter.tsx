import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCategoriesHierarchy } from "@/hooks/useCategories";
import { getCategoryIcon, categoryAnimations } from "@/lib/categories";
import { Skeleton } from "./skeleton";

interface CategoryFilterProps {
  selectedCategory: string;
  onSelectCategory: (categorySlug: string) => void;
  type?: 'product' | 'service';
  className?: string;
  showCard?: boolean;
}

export default function CategoryFilter({
  selectedCategory,
  onSelectCategory,
  type,
  className,
  showCard = true,
}: CategoryFilterProps) {
  const { data: categories, isLoading } = useCategoriesHierarchy(type);
  const [openGroups, setOpenGroups] = useState<string[]>(
    categories?.map(g => g.id) || []
  );

  const toggleGroup = (groupId: string) => {
    setOpenGroups(prev =>
      prev.includes(groupId)
        ? prev.filter(g => g !== groupId)
        : [...prev, groupId]
    );
  };

  // Individual category button with hover animation
  const CategoryButton = ({ 
    category, 
    slug, 
    name 
  }: { 
    category?: { id: string; slug: string; name: string }; 
    slug?: string; 
    name?: string;
  }) => {
    const categorySlug = category?.slug || slug || 'all';
    const categoryName = category?.name || name || 'All';
    const Icon = getCategoryIcon(categorySlug);
    const active = selectedCategory === categorySlug;

    return (
      <motion.button
        onClick={() => onSelectCategory(categorySlug)}
        whileHover={{ x: 4 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors text-sm",
          active
            ? "bg-primary text-primary-foreground"
            : "hover:bg-accent text-foreground"
        )}
      >
        <Icon className="w-4 h-4 flex-shrink-0" />
        <span className="truncate">{categoryName}</span>
      </motion.button>
    );
  };

  const content = (
    <>
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded-lg" />
          ))}
        </div>
      ) : (
        <ScrollArea className="h-[500px]">
          <div className="space-y-1 pr-4">
            {/* "All" option always visible */}
            <div className="mb-2">
              <CategoryButton slug="all" name="All Categories" />
            </div>

            {/* Grouped categories with collapsible sections */}
            {categories?.map((group) => {
              const GroupIcon = getCategoryIcon(group.slug);
              const isOpen = openGroups.includes(group.id);
              const hasChildren = group.children && group.children.length > 0;

              return (
                <div key={group.id} className="mb-2">
                  {/* Group header / Parent category button */}
                  <div className="flex items-center">
                    {hasChildren ? (
                      <button
                        onClick={() => toggleGroup(group.id)}
                        className={cn(
                          "flex items-center justify-between w-full px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors",
                          "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <GroupIcon className="w-3.5 h-3.5" />
                          <span>{group.name}</span>
                        </div>
                        <motion.div
                          animate={{ rotate: isOpen ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronDown className="w-4 h-4" />
                        </motion.div>
                      </button>
                    ) : (
                      <CategoryButton category={group} />
                    )}
                  </div>

                  {/* Child categories */}
                  <AnimatePresence initial={false}>
                    {hasChildren && isOpen && (
                      <motion.div
                        initial="closed"
                        animate="open"
                        exit="closed"
                        variants={categoryAnimations.collapse}
                        className="overflow-hidden"
                      >
                        <motion.div
                          variants={categoryAnimations.container}
                          initial="hidden"
                          animate="show"
                          className="pl-4 mt-1 space-y-0.5"
                        >
                          {group.children?.map((category) => (
                            <motion.div
                              key={category.id}
                              variants={categoryAnimations.item}
                            >
                              <CategoryButton category={category} />
                            </motion.div>
                          ))}
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      )}
    </>
  );

  if (!showCard) {
    return <div className={className}>{content}</div>;
  }

  return (
    <Card className={cn("sticky top-4", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <LayoutGrid className="w-5 h-5" />
          Categories
        </CardTitle>
      </CardHeader>
      <CardContent>{content}</CardContent>
    </Card>
  );
}

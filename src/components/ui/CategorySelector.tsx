import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCategoriesHierarchy, Category, CategoryWithChildren } from '@/hooks/useCategories';
import { getCategoryIcon, categoryAnimations } from '@/lib/categories';
import { Skeleton } from './skeleton';

interface CategorySelectorProps {
  value: string;
  onChange: (value: string, categoryId?: string) => void;
  type?: 'product' | 'service';
  className?: string;
}

export function CategorySelector({ value, onChange, type, className }: CategorySelectorProps) {
  const { data: categories, isLoading } = useCategoriesHierarchy(type);
  const [openGroups, setOpenGroups] = useState<string[]>([]);

  const toggleGroup = (groupId: string) => {
    setOpenGroups(prev =>
      prev.includes(groupId)
        ? prev.filter(g => g !== groupId)
        : [...prev, groupId]
    );
  };

  if (isLoading) {
    return (
      <div className={cn("space-y-4", className)}>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-6 w-32" />
            <div className="grid grid-cols-2 gap-2">
              {[...Array(4)].map((_, j) => (
                <Skeleton key={j} className="h-14 rounded-xl" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <ScrollArea className={cn("h-[400px] pr-4", className)}>
      <div className="space-y-6">
        {categories?.map((group) => {
          const GroupIcon = getCategoryIcon(group.slug);
          const isOpen = openGroups.includes(group.id);
          const hasChildren = group.children && group.children.length > 0;

          return (
            <div key={group.id} className="space-y-3">
              {/* Group Header */}
              <button
                type="button"
                onClick={() => hasChildren ? toggleGroup(group.id) : onChange(group.slug, group.id)}
                className={cn(
                  "flex items-center justify-between w-full text-sm font-semibold transition-colors py-2 px-3 rounded-lg",
                  value === group.slug
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
              >
                <div className="flex items-center gap-2">
                  <GroupIcon className="w-4 h-4" />
                  <span>{group.name}</span>
                </div>
                {hasChildren && (
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </motion.div>
                )}
              </button>

              {/* Animated Category List */}
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
                      className="grid grid-cols-2 gap-2 pl-2"
                    >
                      {group.children?.map((category) => {
                        const Icon = getCategoryIcon(category.slug);
                        const isSelected = value === category.slug;

                        return (
                          <motion.button
                            key={category.id}
                            type="button"
                            variants={categoryAnimations.item}
                            onClick={() => onChange(category.slug, category.id)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={cn(
                              "flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all",
                              isSelected
                                ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                                : "border-border hover:border-primary/50 hover:bg-accent/50"
                            )}
                          >
                            <div
                              className={cn(
                                "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                                isSelected
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-secondary text-secondary-foreground"
                              )}
                            >
                              <Icon className="w-4 h-4" />
                            </div>
                            <span className="text-sm font-medium truncate flex-1">
                              {category.name}
                            </span>
                            {isSelected && (
                              <Check className="w-4 h-4 text-primary flex-shrink-0" />
                            )}
                          </motion.button>
                        );
                      })}
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}

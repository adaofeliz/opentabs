'use client';

import { cn } from '@/lib/utils';
import { getBreadcrumbItemsFromPath } from 'fumadocs-core/breadcrumb';
import Link from 'fumadocs-core/link';
import { useTreeContext, useTreePath } from 'fumadocs-ui/contexts/tree';
import { ChevronRight } from 'lucide-react';
import { useMemo } from 'react';

export const RetroPageBreadcrumb = () => {
  const path = useTreePath();
  const { root } = useTreeContext();

  const items = useMemo(() => getBreadcrumbItemsFromPath(root, path, { includePage: true }), [root, path]);

  if (items.length === 0) return null;

  return (
    <nav aria-label="breadcrumb" className="mb-2">
      <ol className="text-muted-foreground flex flex-wrap items-center gap-1.5 text-sm">
        {items.map((item, i) => (
          <li key={i} className="inline-flex items-center gap-1.5">
            {i !== 0 && <ChevronRight className="text-muted-foreground size-3.5 shrink-0" aria-hidden="true" />}
            {item.url ? (
              <Link
                href={item.url}
                className={cn(
                  'hover:text-foreground max-w-[200px] truncate py-1 font-medium transition-colors max-sm:max-w-[120px]',
                  i === items.length - 1 && 'text-foreground font-semibold',
                )}>
                {item.name}
              </Link>
            ) : (
              <span
                aria-current="page"
                className="text-foreground max-w-[200px] truncate py-1 font-semibold max-sm:max-w-[120px]">
                {item.name}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

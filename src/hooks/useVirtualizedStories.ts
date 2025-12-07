import { useMemo } from 'react';

import type { Story } from '../types/hackerNews';

interface UseVirtualizedStoriesArgs {
  stories: Story[];
  containerHeight: number;
  scrollTop: number;
  rowHeight: number;
  bufferRows: number;
}

export function useVirtualizedStories({
  stories,
  containerHeight,
  scrollTop,
  rowHeight,
  bufferRows,
}: UseVirtualizedStoriesArgs) {
  return useMemo(() => {
    const visibleRowCount = Math.ceil(containerHeight / rowHeight) + bufferRows * 2;
    const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - bufferRows);
    const endIndex = Math.min(stories.length, startIndex + visibleRowCount);
    const offsetY = startIndex * rowHeight;
    const bottomSpacerHeight = Math.max((stories.length - endIndex) * rowHeight, 0);
    const visibleStories = stories.slice(startIndex, endIndex);

    return {
      offsetY,
      bottomSpacerHeight,
      visibleStories,
    };
  }, [stories, containerHeight, scrollTop, rowHeight, bufferRows]);
}

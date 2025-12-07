import type { Story } from '../types/hackerNews';

export interface VirtualizedStoriesArgs {
  stories: Story[];
  containerHeight: number;
  scrollTop: number;
  rowHeight: number;
  bufferRows: number;
}

export interface VirtualizedStoriesResult {
  offsetY: number;
  bottomSpacerHeight: number;
  visibleStories: Story[];
}

export function calculateVirtualizedStories({
  stories,
  containerHeight,
  scrollTop,
  rowHeight,
  bufferRows,
}: VirtualizedStoriesArgs): VirtualizedStoriesResult {
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
}

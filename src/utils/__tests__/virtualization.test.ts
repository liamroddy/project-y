import type { Story } from '../../types/hackerNews';
import { calculateVirtualizedStories } from '../virtualization';

function makeStory(id: number, overrides: Partial<Story> = {}): Story {
  return {
    id,
    by: `author-${String(id)}`,
    title: `Story ${String(id)}`,
    score: 100,
    time: 1_700_000_000,
    type: 'story',
    ...overrides,
  };
}

function buildStories(count: number) {
  return Array.from({ length: count }, (_, index) => makeStory(index + 1));
}

describe('calculateVirtualizedStories', () => {
  it('clamps the start index at zero when the buffer extends above the first item', () => {
    const stories = buildStories(20);

    const result = calculateVirtualizedStories({
      stories,
      containerHeight: 400,
      scrollTop: 150,
      rowHeight: 100,
      bufferRows: 3,
    });

    expect(result.offsetY).toBe(0);
    expect(result.visibleStories).toEqual(stories.slice(0, 10));
    expect(result.bottomSpacerHeight).toBe(1_000);
  });

  it('calculates the visible window, offset, and remaining rows as scrolling progresses', () => {
    const stories = buildStories(12);

    const result = calculateVirtualizedStories({
      stories,
      containerHeight: 200,
      scrollTop: 275,
      rowHeight: 50,
      bufferRows: 1,
    });

    expect(result.visibleStories).toEqual(stories.slice(4, 10));
    expect(result.offsetY).toBe(200);
    expect(result.bottomSpacerHeight).toBe(100);
  });

  it('does not produce negative spacer heights when nearing the end of the list', () => {
    const stories = buildStories(10);

    const result = calculateVirtualizedStories({
      stories,
      containerHeight: 200,
      scrollTop: 950,
      rowHeight: 100,
      bufferRows: 0,
    });

    expect(result.visibleStories).toEqual(stories.slice(9));
    expect(result.offsetY).toBe(900);
    expect(result.bottomSpacerHeight).toBe(0);
  });
});

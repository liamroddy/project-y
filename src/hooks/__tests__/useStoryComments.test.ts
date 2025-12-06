/** @jest-environment jsdom */
import { jest } from '@jest/globals';
import { act, renderHook } from '@testing-library/react';
import type { CommentNode, Story } from '../../types/hackerNews';
import { createMockUseSWRInfinite } from './mocks/swrMocks';

type UseSWRInfinite = typeof import('swr/infinite').default;
type FetchCommentThread = typeof import('../../services/hackerNewsService').fetchCommentThread;

type StoryThreadKey = readonly ['story-thread', number, number];

const { mockUseSWRInfinite, setupSWR } = createMockUseSWRInfinite<
  CommentNode | null,
  StoryThreadKey
>();
const mockFetchCommentThread = jest.fn() as jest.MockedFunction<FetchCommentThread>;

jest.unstable_mockModule('swr/infinite', () => ({
  default: mockUseSWRInfinite as unknown as UseSWRInfinite,
}));

jest.unstable_mockModule('../../services/hackerNewsService', () => ({
  fetchCommentThread: mockFetchCommentThread,
}));

const { useStoryComments } = await import('../useStoryComments');

function makeStory(id: number, overrides: Partial<Story> = {}): Story {
  return {
    id,
    by: 'author',
    title: `Story ${String(id)}`,
    score: 10,
    time: 1_700_000_000,
    type: 'story',
    kids: [],
    ...overrides,
  };
}

function makeCommentNode(id: number, overrides: Partial<CommentNode> = {}): CommentNode {
  return {
    id,
    parent: 0,
    time: 1_700_000_000,
    type: 'comment',
    text: `Comment ${String(id)}`,
    by: `author-${String(id)}`,
    children: [],
    ...overrides,
  };
}

describe('useStoryComments', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSWRInfinite.mockReset();
    mockFetchCommentThread.mockReset();
  });

  it('filters null entries and exposes derived state', () => {
    const commentA = makeCommentNode(1);
    const commentB = makeCommentNode(2);
    const story = makeStory(10, { kids: [1, 2, 3] });
    setupSWR({
      data: [commentA, null, commentB],
      error: new Error('boom'),
    });

    const { result } = renderHook(() => useStoryComments(story));

    expect(result.current.comments).toEqual([commentA, commentB]);
    expect(result.current.resolvedCount).toBe(3);
    expect(result.current.hasMore).toBe(false);
    expect(result.current.isLoadingInitial).toBe(false);
    expect(result.current.error).toBe('boom');
  });

  it('marks the first render as loading while validating the initial page', () => {
    const story = makeStory(11, { kids: [101, 102] });
    setupSWR({
      data: undefined,
      isValidating: true,
    });

    const { result } = renderHook(() => useStoryComments(story));

    expect(result.current.isLoadingInitial).toBe(true);
    expect(result.current.comments).toEqual([]);
  });

  it('increments the requested size when loadMore is called and more threads exist', () => {
    const story = makeStory(20, { kids: [1, 2, 3, 4, 5] });
    const setSize = jest.fn();
    setupSWR({
      data: [makeCommentNode(1)],
      setSize,
      size: 3,
    });

    const { result } = renderHook(() => useStoryComments(story));

    act(() => {
      result.current.loadMore();
    });

    expect(setSize).toHaveBeenCalledTimes(1);
    const increment = setSize.mock.calls[0]?.[0] as (current: number) => number;
    expect(increment(2)).toBe(5);
  });

  it('ignores loadMore calls when there is no story or no remaining threads', () => {
    const setSize = jest.fn();
    setupSWR({ setSize });

    const { result: noStory } = renderHook(() => useStoryComments());
    act(() => {
      noStory.current.loadMore();
    });
    expect(setSize).not.toHaveBeenCalled();

    const secondSetSize = jest.fn();
    const story = makeStory(30, { kids: [7] });
    setupSWR({
      data: [makeCommentNode(7)],
      setSize: secondSetSize,
    });

    const { result: resolvedStory } = renderHook(() => useStoryComments(story));
    act(() => {
      resolvedStory.current.loadMore();
    });
    expect(secondSetSize).not.toHaveBeenCalled();
  });

  it('prefetches additional threads when available', () => {
    const story = makeStory(40, { kids: [1, 2, 3, 4, 5] });
    const setSize = jest.fn();
    setupSWR({
      data: [makeCommentNode(1), makeCommentNode(2), makeCommentNode(3)],
      setSize,
      size: 3,
    });

    renderHook(() => useStoryComments(story));

    expect(setSize).toHaveBeenCalledWith(5);
  });

  it('builds fetch keys per top-level id and fetches the correct thread', async () => {
    const story = makeStory(50, { kids: [15, 16] });
    mockFetchCommentThread.mockResolvedValue(makeCommentNode(15));
    const { getKey, fetcher } = setupSWR();

    renderHook(() => useStoryComments(story));

    const keyLoader = getKey();
    expect(keyLoader(0, null)).toEqual(['story-thread', story.id, 15]);
    expect(keyLoader(1, null)).toEqual(['story-thread', story.id, 16]);
    expect(keyLoader(2, null)).toBeNull();

    const fetcherFn = fetcher();
    await fetcherFn(['story-thread', story.id, 15]);

    expect(mockFetchCommentThread).toHaveBeenCalledWith(15);
  });

  describe('error logging', () => {
    let originalConsoleError: typeof console.error;

    beforeEach(() => {
      originalConsoleError = console.error;
      console.error = jest.fn();
    });

    afterEach(() => {
      console.error = originalConsoleError;
    });

    it('logs an error with the story id when error occurs and story is provided', () => {
      const story = makeStory(99, { kids: [200] });
      const error = new Error('fetch failed');
      setupSWR({ data: [null], error });

      renderHook(() => useStoryComments(story));

      expect(console.error).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledWith('Failed to load comments for story 99', error);
    });

    it('logs an error with unknown story label when error occurs and no story is provided', () => {
      const error = new Error('fetch failed');
      setupSWR({ error });

      renderHook(() => useStoryComments());

      expect(console.error).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledWith(
        'Failed to load story comments for unknown story',
        error,
      );
    });
  });
});

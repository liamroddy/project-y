/** @jest-environment jsdom */
import { jest } from '@jest/globals';
import { act, renderHook } from '@testing-library/react';
import type { StoriesBatch, Story, StoryFeedSort } from '../../types/hackerNews';
import { createMockUseSWRInfinite } from './mocks/swrMocks';

type UseSWRInfinite = typeof import('swr/infinite').default;
type FetchStoryIds = typeof import('../../services/hackerNewsService').fetchStoryIds;
type FetchStoriesBatch = typeof import('../../services/hackerNewsService').fetchStoriesBatch;

type StoriesKey = readonly ['stories', StoryFeedSort, number, number];
const { mockUseSWRInfinite, setupSWR } = createMockUseSWRInfinite<StoriesBatch, StoriesKey>();
const mockFetchStoryIds = jest.fn() as jest.MockedFunction<FetchStoryIds>;
const mockFetchStoriesBatch = jest.fn() as jest.MockedFunction<FetchStoriesBatch>;

jest.unstable_mockModule('swr/infinite', () => ({
  default: mockUseSWRInfinite as unknown as UseSWRInfinite,
}));

jest.unstable_mockModule('../../services/hackerNewsService', () => ({
  fetchStoriesBatch: mockFetchStoriesBatch,
  fetchStoryIds: mockFetchStoryIds,
}));

const { useStoriesFeed } = await import('../useStoriesFeed');

function makeStory(id: number, overrides: Partial<Story> = {}): Story {
  return {
    id,
    by: 'author',
    title: `Story ${String(id)}`,
    score: 100,
    time: 1_700_000_000,
    type: 'story',
    ...overrides,
  };
}

describe('useStoriesFeed', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSWRInfinite.mockReset();
    mockFetchStoryIds.mockReset();
    mockFetchStoriesBatch.mockReset();
  });

  it('returns a deduplicated story list with derived flags', () => {
    const storyA = makeStory(1);
    const storyB = makeStory(2);
    const storyC = makeStory(3);
    setupSWR({
      data: [
        { stories: [storyA, storyB], nextStart: 2, hasMore: true },
        { stories: [storyB, storyC], nextStart: 4, hasMore: false },
      ],
      error: new Error('network'),
      isLoading: true,
      isValidating: true,
    });

    const { result } = renderHook(() => useStoriesFeed('new'));

    expect(result.current.stories).toEqual([storyA, storyB, storyC]);
    expect(result.current.feedType).toBe('new');
    expect(result.current.hasMore).toBe(false);
    expect(result.current.isInitializing).toBe(true);
    expect(result.current.isFetchingMore).toBe(true);
    expect(result.current.error).toBeInstanceOf(Error);
  });

  it('increments the page size when loadMore is triggered and more data exists', async () => {
    const setSize = jest.fn(() => Promise.resolve(undefined));
    setupSWR({
      data: [{ stories: [makeStory(1)], nextStart: 1, hasMore: true }],
      isValidating: false,
      setSize,
    });

    const { result } = renderHook(() => useStoriesFeed());

    await act(async () => {
      await result.current.loadMore();
    });

    expect(setSize).toHaveBeenCalledTimes(1);
    const [increment] = (setSize.mock.calls[0] ?? []) as unknown as [(value: number) => number];
    expect(increment(2)).toBe(3);
  });

  it('does not request another page while fetching or when no more pages exist', async () => {
    const setSize = jest.fn();
    setupSWR({
      data: [{ stories: [makeStory(1)], nextStart: 1, hasMore: false }],
      isValidating: true,
      setSize,
    });

    const { result } = renderHook(() => useStoriesFeed());

    await act(async () => {
      await result.current.loadMore();
    });

    expect(setSize).not.toHaveBeenCalled();
  });

  it('refreshes the feed by resetting the session and revalidating data', async () => {
    const setSize = jest.fn(() => Promise.resolve(undefined));
    const mutate = jest.fn(() => Promise.resolve(undefined));
    const { getKey } = setupSWR({ setSize, mutate });

    const { result } = renderHook(() => useStoriesFeed());

    const initialKey = getKey()(0, null);
    expect(initialKey[3]).toBe(0);

    await act(async () => {
      await result.current.refresh();
    });

    expect(setSize).toHaveBeenCalledWith(1);
    expect(mutate).toHaveBeenCalledTimes(1);

    const refreshedKey = getKey()(0, null);
    expect(refreshedKey[3]).toBe(1);
  });

  it('caches fetched ids within a session to avoid duplicate fetches', async () => {
    mockFetchStoryIds.mockResolvedValue([101, 102]);
    mockFetchStoriesBatch.mockResolvedValue({ stories: [], nextStart: 0, hasMore: false });
    const { fetcher } = setupSWR();

    renderHook(() => useStoriesFeed());

    const fetcherFn = fetcher();
    await fetcherFn(['stories', 'top', 0, 0]);
    await fetcherFn(['stories', 'top', 20, 0]);

    expect(mockFetchStoryIds).toHaveBeenCalledTimes(1);
    expect(mockFetchStoriesBatch).toHaveBeenNthCalledWith(1, 'top', 0, undefined, {
      ids: [101, 102],
    });
    expect(mockFetchStoriesBatch).toHaveBeenNthCalledWith(2, 'top', 20, undefined, {
      ids: [101, 102],
    });
  });

  it('fetches a new id list when the session changes', async () => {
    mockFetchStoryIds.mockResolvedValueOnce([1]).mockResolvedValueOnce([2]);
    mockFetchStoriesBatch.mockResolvedValue({ stories: [], nextStart: 0, hasMore: false });
    const { fetcher } = setupSWR();

    const { result } = renderHook(() => useStoriesFeed());
    const fetcherFn = fetcher();

    await fetcherFn(['stories', 'top', 0, 0]);

    await act(async () => {
      await result.current.refresh();
    });

    await fetcherFn(['stories', 'top', 0, 1]);

    expect(mockFetchStoryIds).toHaveBeenCalledTimes(2);
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

    it('logs an error when the feed has an error', () => {
      const error = new Error('boom');
      setupSWR({ error });

      renderHook(() => useStoriesFeed('top'));

      expect(console.error).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('Failed to load Hacker News stories feed (top)'),
        error
      );
    });

    it('does not log when there is no error', () => {
      setupSWR({});
      renderHook(() => useStoriesFeed('top'));
      expect(console.error).not.toHaveBeenCalled();
    });
  });
});

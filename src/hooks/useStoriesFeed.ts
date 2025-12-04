import { useCallback, useMemo, useRef, useState } from 'react';
import useSWRInfinite from 'swr/infinite';

import { fetchStoriesBatch, fetchStoryIds } from '../services/hackerNewsService';
import type { StoriesBatch, Story, StoryFeedSort } from '../types/hackerNews';

type StoriesKey = readonly ['stories', StoryFeedSort, number, number];

export function useStoriesFeed(initialFeed: StoryFeedSort = 'top') {
  const [feedType, setFeedTypeState] = useState<StoryFeedSort>(initialFeed);
  const [sessionId, setSessionId] = useState(0);
  const idsCacheRef = useRef<Map<string, number[]>>(new Map());

  const makeCacheKey = useCallback(
    (feed: StoryFeedSort, session: number) => `${feed}:${String(session)}`,
    [],
  );

  const clearCacheForFeed = useCallback((targetFeed: StoryFeedSort) => {
    const prefix = `${targetFeed}:`;
    for (const key of Array.from(idsCacheRef.current.keys())) {
      if (key.startsWith(prefix)) {
        idsCacheRef.current.delete(key);
      }
    }
  }, []);

  const startNewSession = useCallback(
    (targetFeed: StoryFeedSort) => {
      clearCacheForFeed(targetFeed);
      setSessionId((current) => current + 1);
    },
    [clearCacheForFeed],
  );

  const getKey = useCallback(
    (pageIndex: number, previousPageData: StoriesBatch | null): StoriesKey | null => {
      if (previousPageData && !previousPageData.hasMore) {
        return null;
      }

      if (pageIndex === 0) {
        return ['stories', feedType, 0, sessionId];
      }

      if (!previousPageData) {
        return null;
      }

      return ['stories', feedType, previousPageData.nextStart, sessionId];
    },
    [feedType, sessionId],
  );

  const fetcher = useCallback(
    async ([, currentFeed, start, currentSession]: StoriesKey) => {
      const cacheKey = makeCacheKey(currentFeed, currentSession);
      let ids = idsCacheRef.current.get(cacheKey);

      if (!ids) {
        ids = await fetchStoryIds(currentFeed);
        idsCacheRef.current.set(cacheKey, ids);
      }

      return fetchStoriesBatch(currentFeed, start, undefined, { ids });
    },
    [makeCacheKey],
  );

  const { data, error, setSize, isLoading, isValidating, mutate } = useSWRInfinite<
    StoriesBatch,
    Error
  >(getKey, fetcher);

  const stories = useMemo(() => {
    if (!data) {
      return [];
    }

    const seen = new Set<number>();
    const uniqueStories: Story[] = [];

    for (const page of data) {
      for (const story of page.stories) {
        if (seen.has(story.id)) {
          continue;
        }

        seen.add(story.id);
        uniqueStories.push(story);
      }
    }

    return uniqueStories;
  }, [data]);
  const hasMore = data?.[data.length - 1]?.hasMore ?? false;
  const isInitializing = isLoading;
  const isFetchingMore = isValidating && Boolean(data?.length);

  const loadMore = useCallback(async () => {
    if (!hasMore || isFetchingMore) {
      return;
    }

    await setSize((current) => current + 1);
  }, [hasMore, isFetchingMore, setSize]);

  const refresh = useCallback(async () => {
    startNewSession(feedType);
    await setSize(1);
    await mutate();
  }, [feedType, mutate, setSize, startNewSession]);

  const handleFeedChange = useCallback(
    (nextFeed: StoryFeedSort) => {
      setFeedTypeState(nextFeed);
      startNewSession(nextFeed);
      void setSize(1);
    },
    [setSize, startNewSession],
  );

  return {
    feedType,
    setFeedType: handleFeedChange,
    stories,
    hasMore,
    isInitializing,
    isFetchingMore,
    error,
    loadMore,
    refresh,
  };
}

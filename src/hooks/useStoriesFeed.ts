import { useCallback, useState } from 'react';
import useSWRInfinite from 'swr/infinite';

import { fetchStoriesBatch } from '../services/hackerNewsService';
import type { StoriesBatch, StoryFeedSort } from '../types/hackerNews';

type StoriesKey = readonly ['stories', StoryFeedSort, number];

export function useStoriesFeed(initialFeed: StoryFeedSort = 'top') {
  const [feedType, setFeedTypeState] = useState<StoryFeedSort>(initialFeed);

  const getKey = useCallback(
    (pageIndex: number, previousPageData: StoriesBatch | null): StoriesKey | null => {
      if (previousPageData && !previousPageData.hasMore) {
        return null;
      }

      if (pageIndex === 0) {
        return ['stories', feedType, 0];
      }

      if (!previousPageData) {
        return null;
      }

      return ['stories', feedType, previousPageData.nextStart];
    },
    [feedType],
  );

  const fetcher = useCallback(
    async ([, currentFeed, start]: StoriesKey) => fetchStoriesBatch(currentFeed, start),
    [],
  );

  const { data, error, setSize, isLoading, isValidating, mutate } = useSWRInfinite<
    StoriesBatch,
    Error
  >(getKey, fetcher);

  const stories = data?.flatMap((page) => page.stories) ?? [];
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
    await setSize(1);
    await mutate();
  }, [mutate, setSize]);

  const handleFeedChange = useCallback(
    (nextFeed: StoryFeedSort) => {
      setFeedTypeState(nextFeed);
      void setSize(1);
    },
    [setSize],
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

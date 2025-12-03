import { useCallback, useEffect, useState } from 'react';
import { fetchStoriesBatch } from '../services/hackerNewsService';
import type { Story, StoryFeedSort } from '../types/hackerNews';

export function useStoriesFeed(initialFeed: StoryFeedSort = 'top') {
  // Lot of individual states - is this better as a reducer? TODO
  const [feedType, setFeedType] = useState<StoryFeedSort>(initialFeed);
  const [stories, setStories] = useState<Story[]>([]);
  const [nextStart, setNextStart] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsInitializing(true);
    setError(null);

    try {
      const batch = await fetchStoriesBatch(feedType, 0);
      setStories(batch.stories);
      setNextStart(batch.nextStart);
      setHasMore(batch.hasMore);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Unable to fetch stories';
      setError(message);
      setStories([]);
      setHasMore(false);
    } finally {
      setIsInitializing(false); 
    }
  }, [feedType]);

  const loadMore = useCallback(async () => {
    if (isInitializing || isFetchingMore || !hasMore) {
      return;
    }

    setIsFetchingMore(true);
    setError(null);

    try {
      const batch = await fetchStoriesBatch(feedType, nextStart);
      setStories((current) => [...current, ...batch.stories]);
      setNextStart(batch.nextStart);
      setHasMore(batch.hasMore);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Unable to fetch more stories';
      setError(message);
    } finally {
      setIsFetchingMore(false);
    }
  }, [feedType, hasMore, isFetchingMore, isInitializing, nextStart]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const handleFeedChange = useCallback((nextFeed: StoryFeedSort) => {
    setFeedType(nextFeed);
  }, []);

  return {
    feedType,
    stories,
    hasMore,
    isInitializing,
    isFetchingMore,
    error,
    loadMore,
    setFeedType: handleFeedChange,
    refresh,
  };
}

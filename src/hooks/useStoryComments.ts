import { useEffect } from 'react';
import useSWRInfinite from 'swr/infinite';

import { fetchCommentThread } from '../services/hackerNewsService';
import type { CommentNode, Story } from '../types/hackerNews';

type StoryThreadKey = readonly ['story-thread', number, number];

const THREADS_PER_BATCH = 3;
const PREFETCH_BUFFER = 2;

export function useStoryComments(story?: Story | null) {
  const topLevelIds = story?.kids ?? [];
  const hasStory = Boolean(story);
  const initialSize = hasStory ? Math.min(THREADS_PER_BATCH, topLevelIds.length) : 0;

  const { data, error, isValidating, size, setSize } = useSWRInfinite<CommentNode | null, Error>(
    (pageIndex: number): StoryThreadKey | null => {
      if (!story) {
        return null;
      }

      const commentId = topLevelIds.at(pageIndex);
      if (commentId === undefined) {
        return null;
      }

      return ['story-thread', story.id, commentId];
    },
    ([, , commentId]: StoryThreadKey) => fetchCommentThread(commentId),
    {
      revalidateFirstPage: false,
      parallel: false,
      initialSize,
    },
  );

  const resolvedPages = data ?? [];
  const comments = resolvedPages.filter((node): node is CommentNode => node != null);
  const resolvedCount = resolvedPages.length;
  const totalThreads = topLevelIds.length;
  const hasMore = Boolean(story) && resolvedCount < totalThreads;
  const isLoadingInitial =
    Boolean(story) && totalThreads > 0 && resolvedCount === 0 && isValidating;

  const loadMore = () => {
    if (!story || !hasMore) {
      return;
    }

    void setSize((current) => Math.min(current + THREADS_PER_BATCH, totalThreads));
  };

  useEffect(() => {
    if (!story || !hasMore) {
      return;
    }

    const desiredSize = Math.min(totalThreads, resolvedCount + PREFETCH_BUFFER);
    if (size < desiredSize) {
      void setSize(desiredSize);
    }
  }, [hasMore, resolvedCount, setSize, size, story, totalThreads]);

  return {
    comments,
    error: error?.message ?? null,
    hasMore,
    isLoadingInitial,
    loadMore,
    resolvedCount,
  };
}

import useSWR from 'swr';

import { fetchStoryComments } from '../services/hackerNewsService';
import type { CommentNode } from '../types/hackerNews';

type StoryCommentsKey = readonly ['story-comments', number];

export function useStoryComments(storyId?: number | null) {
  const shouldFetch = storyId != null;
  const key: StoryCommentsKey | null = shouldFetch ? ['story-comments', storyId] : null;

  const { data, error, isLoading, isValidating } = useSWR<CommentNode[], Error>(
    key,
    ([, id]: StoryCommentsKey) => fetchStoryComments(id),
  );

  return {
    comments: shouldFetch && data ? data : [],
    isLoading: shouldFetch ? isLoading || (!data && isValidating) : false,
    error: error?.message ?? null,
  };
}

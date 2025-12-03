import { useEffect, useState } from 'react';
import { fetchStoryComments } from '../services/hackerNewsService';
import type { CommentNode } from '../types/hackerNews';

export function useStoryComments(storyId?: number | null) {
  const [comments, setComments] = useState<CommentNode[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    if (!storyId) {
      setComments([]);
      setError(null);
      setIsLoading(false);
      return;
    }

    const loadComments = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetchStoryComments(storyId);
        if (!isCancelled) {
          setComments(response);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unable to load comments';
        if (!isCancelled) {
          setError(message);
          setComments([]);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadComments();

    return () => {
      isCancelled = true;
    };
  }, [storyId]);

  return { comments, isLoading, error };
}

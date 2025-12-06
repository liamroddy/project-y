import type { Comment, CommentNode, StoriesBatch, Story, StoryFeedSort } from '../types/hackerNews';

const API_BASE = 'https://hacker-news.firebaseio.com/v0';
const PAGE_SIZE = 20;

class HackerNewsApiError extends Error {
  readonly status?: number;
  readonly endpoint: string;

  constructor(endpoint: string, status?: number, message?: string, options?: ErrorOptions) {
    const fallback = status
      ? `Hacker News request failed (${String(status)})`
      : 'Hacker News request failed';
    super(message ?? fallback, options);
    this.name = 'HackerNewsApiError';
    this.endpoint = endpoint;
    this.status = status;
  }
}

export class HackerNewsRequestAbortedError extends Error {
  readonly endpoint: string;

  constructor(endpoint: string, options?: ErrorOptions) {
    super(`Hacker News request aborted: ${endpoint}`, options);
    this.name = 'HackerNewsRequestAbortedError';
    this.endpoint = endpoint;
  }
}

interface FetchOptions {
  signal?: AbortSignal;
}

interface StoriesBatchOptions extends FetchOptions {
  ids?: number[];
}

async function fetchJson<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { signal } = options;
  const resource = `${API_BASE}/${endpoint}.json`;

  try {
    const response = await fetch(resource, { signal });

    if (!response.ok) {
      throw new HackerNewsApiError(endpoint, response.status);
    }

    const payload = (await response.json()) as T;
    return payload;
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new HackerNewsRequestAbortedError(endpoint, { cause: error });
    }

    if (error instanceof HackerNewsApiError) {
      throw error;
    }

    if (error instanceof Error) {
      throw new HackerNewsApiError(endpoint, undefined, error.message, { cause: error });
    }

    throw error;
  }
}

function extractDomain(url?: string): string | undefined {
  if (!url) {
    return undefined;
  }

  try {
    const parsed = new URL(url);
    return parsed.host.replace(/^www\./, '');
  } catch {
    return undefined;
  }
}

async function getStoryIds(feed: StoryFeedSort, options?: FetchOptions): Promise<number[]> {
  const endpoint = feed === 'top' ? 'topstories' : 'newstories';
  const ids = await fetchJson<number[]>(endpoint, options);
  return ids;
}

export async function fetchStoryIds(
  feed: StoryFeedSort,
  options?: FetchOptions,
): Promise<number[]> {
  return getStoryIds(feed, options);
}

async function loadStory(id: number, options?: FetchOptions): Promise<Story | null> {
  const rawStory = await fetchJson<Story | null>(`item/${String(id)}`, options);

  if (rawStory?.type !== 'story') {
    return null;
  }

  const storyWithDomain: Story = {
    ...rawStory,
    domain: extractDomain(rawStory.url),
  };

  return storyWithDomain;
}

async function loadComment(id: number, options?: FetchOptions): Promise<Comment | null> {
  const comment = await fetchJson<Comment | Story | null>(`item/${String(id)}`, options);
  if (comment?.type !== 'comment') {
    return null;
  }

  return comment;
}

async function buildCommentTree(ids?: number[], options?: FetchOptions): Promise<CommentNode[]> {
  if (!ids?.length) {
    return [];
  }

  const nodes: (CommentNode | null)[] = await Promise.all(
    ids.map(async (commentId) => {
      const comment = await loadComment(commentId, options);

      if (!comment || comment.deleted || comment.dead) {
        return null;
      }

      const children = await buildCommentTree(comment.kids, options);
      const enrichedComment: CommentNode = {
        ...comment,
        children,
      };
      return enrichedComment;
    }),
  );

  return nodes.filter((node): node is CommentNode => node !== null);
}

export async function fetchStoriesBatch(
  feed: StoryFeedSort,
  start = 0,
  limit = PAGE_SIZE,
  options?: StoriesBatchOptions,
): Promise<StoriesBatch> {
  const { ids: providedIds, ...fetchOptions } = options ?? {};
  const ids = providedIds ?? (await getStoryIds(feed, fetchOptions));
  const slice = ids.slice(start, start + limit);

  const stories = (await Promise.all(slice.map((id) => loadStory(id, fetchOptions)))).filter(
    (story): story is Story => story !== null,
  );

  const nextStart = start + slice.length;
  return {
    stories,
    nextStart,
    hasMore: nextStart < ids.length,
  };
}

export async function fetchCommentThread(
  commentId: number,
  options?: FetchOptions,
): Promise<CommentNode | null> {
  const thread = (await buildCommentTree([commentId], options)).at(0);
  return thread ?? null;
}

export async function fetchStoryComments(
  storyId: number,
  options?: FetchOptions,
): Promise<CommentNode[]> {
  const story = await loadStory(storyId, options);
  if (!story) {
    return [];
  }

  return buildCommentTree(story.kids, options);
}

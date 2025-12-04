import type { Comment, CommentNode, StoriesBatch, Story, StoryFeedSort } from '../types/hackerNews';

const API_BASE = 'https://hacker-news.firebaseio.com/v0';
const PAGE_SIZE = 20;

const storyCache = new Map<number, Story | null>();
const idCache = new Map<StoryFeedSort, number[]>();
const commentCache = new Map<number, Comment | null>();

async function fetchJson<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_BASE}/${endpoint}.json`);

  if (!response.ok) {
    throw new Error(`Failed to fetch ${endpoint}: ${String(response.status)}`);
  }

  return response.json() as Promise<T>;
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

async function getStoryIds(feed: StoryFeedSort): Promise<number[]> {
  if (idCache.has(feed)) {
    const cached = idCache.get(feed);
    if (cached) return cached;
  }

  const endpoint = feed === 'top' ? 'topstories' : 'newstories';
  const ids = await fetchJson<number[]>(endpoint);
  idCache.set(feed, ids);
  return ids;
}

async function loadStory(id: number): Promise<Story | null> {
  if (storyCache.has(id)) {
    return storyCache.get(id) ?? null;
  }

  const rawStory = await fetchJson<Story | null>(`item/${String(id)}`);

  if (rawStory?.type !== 'story') {
    storyCache.set(id, null);
    return null;
  }

  const storyWithDomain: Story = {
    ...rawStory,
    domain: extractDomain(rawStory.url),
  };

  storyCache.set(id, storyWithDomain);
  return storyWithDomain;
}

async function loadComment(id: number): Promise<Comment | null> {
  if (commentCache.has(id)) {
    return commentCache.get(id) ?? null;
  }

  const comment = await fetchJson<Comment>(`item/${String(id)}`);
  commentCache.set(id, comment);
  return comment;
}

async function buildCommentTree(ids?: number[]): Promise<CommentNode[]> {
  if (!ids?.length) {
    return [];
  }

  const nodes: (CommentNode | null)[] = await Promise.all(
    ids.map(async (commentId) => {
      const comment = await loadComment(commentId);

      if (!comment || comment.deleted || comment.dead) {
        return null;
      }

      const children = await buildCommentTree(comment.kids);
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
): Promise<StoriesBatch> {
  const ids = await getStoryIds(feed);
  const slice = ids.slice(start, start + limit);

  const stories = (await Promise.all(slice.map((id) => loadStory(id)))).filter(
    (story): story is Story => (story !== null),
  );

  const nextStart = start + slice.length;
  return {
    stories,
    nextStart,
    hasMore: nextStart < ids.length,
  };
}

export async function fetchStoryComments(storyId: number): Promise<CommentNode[]> {
  const story = await loadStory(storyId);
  if (!story) {
    return [];
  }

  return buildCommentTree(story.kids);
}

export function invalidateFeed(feed?: StoryFeedSort) {
  if (feed) {
    idCache.delete(feed);
    return;
  }

  idCache.clear();
}

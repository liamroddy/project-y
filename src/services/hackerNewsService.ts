import type { StoriesBatch, Story, StoryFeedType } from '../types/hackerNews';

const API_BASE = 'https://hacker-news.firebaseio.com/v0';
const PAGE_SIZE = 20;

const storyCache = new Map<number, Story>();
const idCache = new Map<StoryFeedType, number[]>();

async function fetchJson<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_BASE}/${endpoint}.json`);

  if (!response.ok) {
    throw new Error(`Failed to fetch ${endpoint}: ${response.status}`);
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

async function getStoryIds(feed: StoryFeedType): Promise<number[]> {
  if (idCache.has(feed)) {
    return idCache.get(feed)!;
  }

  const endpoint = feed === 'top' ? 'topstories' : 'newstories';
  const ids = await fetchJson<number[]>(endpoint);
  idCache.set(feed, ids);
  return ids;
}

async function loadStory(id: number): Promise<Story> {
  if (storyCache.has(id)) {
    return storyCache.get(id)!;
  }

  const rawStory = await fetchJson<Story>(`item/${id}`);
  const storyWithDomain: Story = {
    ...rawStory,
    domain: extractDomain(rawStory.url),
  };

  storyCache.set(id, storyWithDomain);
  return storyWithDomain;
}

export async function fetchStoriesBatch(
  feed: StoryFeedType,
  start = 0,
  limit = PAGE_SIZE,
): Promise<StoriesBatch> {
  const ids = await getStoryIds(feed);
  const slice = ids.slice(start, start + limit);

  const stories = await Promise.all(slice.map((id) => loadStory(id)));

  const nextStart = start + slice.length;
  return {
    stories,
    nextStart,
    hasMore: nextStart < ids.length,
  };
}

export function invalidateFeed(feed?: StoryFeedType) {
  if (feed) {
    idCache.delete(feed);
    return;
  }

  idCache.clear();
}

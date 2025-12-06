import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import {
  fetchCommentThread,
  fetchStoryIds,
  fetchStoriesBatch,
  fetchStoryComments,
  HackerNewsRequestAbortedError,
} from '../hackerNewsService';
import type { Story, Comment } from '../../types/hackerNews';

const API_BASE = 'https://hacker-news.firebaseio.com/v0';

type ResponseEntry =
  | {
      kind: 'data';
      payload: unknown;
      ok?: boolean;
      status?: number;
    }
  | {
      kind: 'error';
      error: Error;
    };

const responseMap = new Map<string, ResponseEntry[]>();

const server = setupServer(
  http.get(`${API_BASE}/:path*`, ({ request }) => {
    const url = request.url;
    const queue = responseMap.get(url);

    if (!queue?.length) {
      throw new Error(`No mock response queued for ${url}`);
    }

    const entry = queue.shift();
    if (entry?.kind === 'error') {
      return Promise.reject(entry.error);
    }

    const status = entry?.status ?? (entry?.ok === false ? 500 : 200);
    return HttpResponse.json(entry?.payload as never, {
      status,
    });
  }),
);

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

afterEach(() => {
  responseMap.clear();
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});

function queueJson(endpoint: string, payload: unknown, init?: { ok?: boolean; status?: number }) {
  const url = toUrl(endpoint);
  const queue = responseMap.get(url) ?? [];
  queue.push({ kind: 'data', payload, ...init });
  responseMap.set(url, queue);
}

function queueError(endpoint: string, error: Error) {
  const url = toUrl(endpoint);
  const queue = responseMap.get(url) ?? [];
  queue.push({ kind: 'error', error });
  responseMap.set(url, queue);
}

function toUrl(endpoint: string): string {
  if (endpoint.startsWith('http')) {
    return endpoint;
  }

  return `${API_BASE}/${endpoint}.json`;
}

describe('fetchStoryIds', () => {
  it('fetches top stories ids from Hacker News', async () => {
    queueJson('topstories', [1, 2, 3]);

    const ids = await fetchStoryIds('top');

    expect(ids).toEqual([1, 2, 3]);
  });

  it('fetches new stories ids from Hacker News', async () => {
    queueJson('newstories', [4, 5]);

    const ids = await fetchStoryIds('new');

    expect(ids).toEqual([4, 5]);
  });

  it('wraps non-ok responses in HackerNewsApiError', async () => {
    queueJson('topstories', null, { ok: false, status: 503 });

    await expect(fetchStoryIds('top')).rejects.toMatchObject({
      status: 503,
      endpoint: 'topstories',
    });
  });

  it('converts aborted requests into HackerNewsRequestAbortedError', async () => {
    queueJson('topstories', [1]);
    const controller = new AbortController();
    const promise = fetchStoryIds('top', { signal: controller.signal });
    controller.abort();

    await expect(promise).rejects.toThrow(HackerNewsRequestAbortedError);
  });
});

describe('fetchStoriesBatch', () => {
  it('slices provided ids and filters non-story payloads', async () => {
    const validStory: Story = {
      id: 1,
      type: 'story',
      title: 'Example',
      url: 'https://www.example.com/article',
      by: 'hn',
      score: 10,
      time: 1_700_000_000,
    };
    const nonStory: Comment = {
      id: 2,
      type: 'comment',
      parent: 1,
      text: 'noise',
      time: 1_700_000_000,
    };

    queueJson('item/1', validStory);
    queueJson('item/2', nonStory);
    queueJson('item/3', null);

    const batch = await fetchStoriesBatch('top', 0, 3, { ids: [1, 2, 3] });

    expect(batch.stories).toEqual([
      {
        ...validStory,
        domain: 'example.com',
      },
    ]);
    expect(batch.nextStart).toBe(3);
    expect(batch.hasMore).toBe(false);
  });

  it('fetches ids when not provided and reports pagination info', async () => {
    const storyA: Story = {
      id: 10,
      type: 'story',
      title: 'Story A',
      url: 'https://news.ycombinator.com/item?id=10',
      by: 'userA',
      score: 42,
      time: 1_700_000_001,
    };
    const storyB: Story = {
      ...storyA,
      id: 11,
      title: 'Story B',
    };

    queueJson('newstories', [10, 11, 12]);
    queueJson('item/10', storyA);
    queueJson('item/11', storyB);

    const batch = await fetchStoriesBatch('new', 0, 2);

    expect(batch.stories).toHaveLength(2);
    expect(batch.nextStart).toBe(2);
    expect(batch.hasMore).toBe(true);
  });

  it('wraps unexpected fetch failures in HackerNewsApiError', async () => {
    queueJson('topstories', [5]);
    queueError('item/5', new Error('boom'));

    await expect(fetchStoriesBatch('top', 0, 1)).rejects.toMatchObject({ endpoint: 'item/5' });
  });
});

describe('fetchStoryComments', () => {
  it('builds filtered comment tree', async () => {
    const story: Story = {
      id: 1,
      type: 'story',
      title: 'Story',
      by: 'author',
      score: 1,
      time: 1_700_000_000,
      kids: [101, 102],
    };
    const rootComment: Comment = {
      id: 101,
      type: 'comment',
      parent: 1,
      text: 'Parent',
      time: 1_700_000_001,
      kids: [201],
    };
    const childComment: Comment = {
      id: 201,
      type: 'comment',
      parent: 101,
      text: 'Child',
      time: 1_700_000_002,
    };
    const deletedComment: Comment = {
      id: 102,
      type: 'comment',
      parent: 1,
      text: 'remove me',
      time: 1_700_000_003,
      deleted: true,
    };

    queueJson('item/1', story);
    queueJson('item/101', rootComment);
    queueJson('item/201', childComment);
    queueJson('item/102', deletedComment);

    const comments = await fetchStoryComments(1);

    expect(comments).toEqual([
      {
        ...rootComment,
        children: [
          {
            ...childComment,
            children: [],
          },
        ],
      },
    ]);
  });

  it('returns empty array when the story is missing', async () => {
    queueJson('item/404', null);

    const comments = await fetchStoryComments(404);

    expect(comments).toEqual([]);
  });
});

describe('fetchCommentThread', () => {
  it('returns a nested comment node when available', async () => {
    const rootComment: Comment = {
      id: 300,
      type: 'comment',
      parent: 0,
      text: 'Root',
      time: 1_700_000_100,
      kids: [301],
    };
    const childComment: Comment = {
      id: 301,
      type: 'comment',
      parent: 300,
      text: 'Child',
      time: 1_700_000_101,
    };

    queueJson('item/300', rootComment);
    queueJson('item/301', childComment);

    const thread = await fetchCommentThread(300);

    expect(thread).toEqual({
      ...rootComment,
      children: [
        {
          ...childComment,
          children: [],
        },
      ],
    });
  });

  it('returns null when the comment cannot be loaded', async () => {
    queueJson('item/999', null);

    const thread = await fetchCommentThread(999);

    expect(thread).toBeNull();
  });
});

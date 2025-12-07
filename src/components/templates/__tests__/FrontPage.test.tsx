/** @jest-environment jsdom */
import { jest } from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react';

import type { CommentNode, Story, StoryFeedSort } from '../../../types/hackerNews';

const mockUseStoriesFeed = jest.fn();
const mockUseMediaQuery = jest.fn();
const mockUseStoryComments = jest.fn();

jest.unstable_mockModule('../../../hooks/useStoriesFeed', () => ({
  useStoriesFeed: (...args: unknown[]) => mockUseStoriesFeed(...args),
}));

jest.unstable_mockModule('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: (query: unknown) => mockUseMediaQuery(query),
}));

const { FrontPage } = await import('../FrontPage');

interface MockFeedState {
  feedType: StoryFeedSort;
  setFeedType: jest.Mock;
  stories: Story[];
  hasMore: boolean;
  isInitializing: boolean;
  error: unknown;
  loadMore: jest.Mock;
}

interface MockStoryCommentsState {
  comments: CommentNode[];
  error: string | null;
  hasMore: boolean;
  isLoadingInitial: boolean;
  isValidating: boolean;
  loadMore: jest.Mock;
  resolvedCount: number;
}

function createStory(overrides: Partial<Story> = {}): Story {
  return {
    id: 1,
    by: 'liam',
    title: 'Sample story',
    url: 'https://example.com/story',
    score: 120,
    descendants: 42,
    time: 1_700_000_000,
    type: 'story',
    domain: 'example.com',
    ...overrides,
  };
}

function createFeedState(overrides: Partial<MockFeedState> = {}): MockFeedState {
  return {
    feedType: 'top',
    setFeedType: jest.fn(),
    stories: [createStory()],
    hasMore: true,
    isInitializing: false,
    error: null,
    loadMore: jest.fn(),
    ...overrides,
  };
}

function createStoryCommentsState(
  overrides: Partial<MockStoryCommentsState> = {},
): MockStoryCommentsState {
  return {
    comments: [],
    error: null,
    hasMore: false,
    isLoadingInitial: false,
    isValidating: false,
    loadMore: jest.fn(),
    resolvedCount: 0,
    ...overrides,
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  mockUseStoriesFeed.mockReset();
  mockUseMediaQuery.mockReset();
  mockUseStoryComments.mockReset();
  mockUseMediaQuery.mockReturnValue(false);
  mockUseStoryComments.mockImplementation(() => createStoryCommentsState());
});

beforeAll(() => {
  class ResizeObserverMock {
    observe() {
      return undefined;
    }
    disconnect() {
      return undefined;
    }
  }

  (globalThis as unknown as { ResizeObserver: typeof ResizeObserverMock }).ResizeObserver =
    ResizeObserverMock;
});

describe('FrontPage', () => {
  describe('responsiveness', () => {
    it('renders the header, feed toggle, story feed (but no comments panel) in portrait mode', () => {
      const story = createStory({ title: 'Featured Story' });
      mockUseStoriesFeed.mockReturnValue(createFeedState({ stories: [story] }));

      render(<FrontPage />);

      expect(screen.getByRole('heading', { name: 'Hacker News++' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Top' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'New' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Featured Story/i })).toBeInTheDocument();
      expect(screen.queryByText('No Story Selected')).toBeNull();
      expect(screen.queryByText('Discussion')).toBeNull();
    });

    it('renders the header, feed toggle, story feed AND the comments panel in landscape mode', () => {
      mockUseMediaQuery.mockReturnValue(true);
      const story = createStory({ title: 'Featured Story' });
      mockUseStoriesFeed.mockReturnValue(createFeedState({ stories: [story] }));

      render(<FrontPage />);

      expect(screen.getByRole('heading', { name: 'Hacker News++' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Top' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'New' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Featured Story/i })).toBeInTheDocument();
      expect(screen.queryByText('No Story Selected')).toBeInTheDocument();
    });

    it('toggles the comments panel fullscreen in portrait mode when a story is selected', () => {
      const story = createStory({ title: 'Featured Story' });
      mockUseStoriesFeed.mockReturnValue(createFeedState({ stories: [story] }));

      render(<FrontPage />);

      fireEvent.click(screen.getByRole('button', { name: /Featured Story/i }));
      expect(screen.getByText('Discussion')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Featured Story/i })).toBeNull();

      fireEvent.click(screen.getByRole('button', { name: /Back to story feed/i }));
      expect(screen.queryByText('Discussion')).toBeNull();
      expect(screen.getByRole('button', { name: /Featured Story/i })).toBeInTheDocument();
    });

    it('keeps the story feed AND comments panel visible in landscape mode when a story is selected', () => {
      mockUseMediaQuery.mockReturnValue(true);
      const story = createStory({ title: 'Featured Story' });
      mockUseStoriesFeed.mockReturnValue(createFeedState({ stories: [story] }));

      render(<FrontPage />);

      fireEvent.click(screen.getByRole('button', { name: /Featured Story/i }));
      expect(screen.getByText('Discussion')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Featured Story/i })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Back to story feed/i })).toBeNull();
    });
  });

  it('switches feeds when the toggle value changes', () => {
    const setFeedType = jest.fn();
    mockUseStoriesFeed.mockReturnValue(createFeedState({ setFeedType }));

    render(<FrontPage />);
    fireEvent.click(screen.getByRole('button', { name: 'New' }));

    expect(setFeedType).toHaveBeenCalledWith('new');
  });

  it('shows the error banner once initialization finishes', () => {
    const error = new Error('Network down');
    mockUseStoriesFeed.mockReturnValue(createFeedState({ error, isInitializing: false }));

    render(<FrontPage />);

    expect(screen.getByRole('alert')).toHaveTextContent('Error: Network down');
  });
});

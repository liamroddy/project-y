/** @jest-environment jsdom */
import { jest } from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react';
import type { ComponentProps, ReactNode } from 'react';

import type { Story } from '../../../types/hackerNews';
import { StoryFeed } from '../StoryFeed';

jest.mock('react-infinite-scroll-component', () => ({
  __esModule: true,
  default: ({ children, endMessage }: { children: ReactNode; endMessage?: ReactNode }) => (
    <div data-testid="infinite-scroll">
      {children}
      {endMessage ?? null}
    </div>
  ),
}));

jest.mock('../../../utils/virtualization', () => ({
  calculateVirtualizedStories: jest.fn(({ stories }: { stories: Story[] }) => ({
    offsetY: 0,
    bottomSpacerHeight: 0,
    visibleStories: stories,
  })),
}));

type StoryFeedProps = ComponentProps<typeof StoryFeed>;

function createStory(overrides: Partial<Story> = {}): Story {
  return {
    id: 1,
    by: 'siobhan',
    title: 'Sample story',
    url: 'https://example.com/story',
    score: 100,
    descendants: 20,
    time: 1_700_000_000,
    type: 'story',
    domain: 'example.com',
    ...overrides,
  };
}

function createBaseProps(overrides: Partial<StoryFeedProps> = {}): StoryFeedProps {
  return {
    feedType: 'top',
    stories: [],
    hasMore: true,
    isInitializing: false,
    loadMore: jest.fn(() => undefined),
    isLandscape: false,
    selectedStoryId: null,
    ...overrides,
  };
}

beforeAll(() => {
  class ResizeObserverMock {
    observe = jest.fn();
    disconnect = jest.fn();
  }

  type ResizeObserverLike = new () => { observe: () => void; disconnect: () => void };
  (globalThis as unknown as { ResizeObserver: ResizeObserverLike }).ResizeObserver =
    ResizeObserverMock;
});

describe('StoryFeed', () => {
  it('renders the loading state while initializing', () => {
    render(<StoryFeed {...createBaseProps({ isInitializing: true })} />);

    expect(screen.getByText(/Loading the latest stories/i)).toBeInTheDocument();
  });

  it('renders the empty state when there are no stories', () => {
    render(<StoryFeed {...createBaseProps()} />);

    expect(screen.getByText('No stories yet')).toBeInTheDocument();
    expect(screen.getByText('Try switching feeds or refreshing the page.')).toBeInTheDocument();
  });

  it('renders visible stories in link mode for portrait layouts', () => {
    const stories = [createStory({ id: 1 }), createStory({ id: 2, title: 'Second story' })];
    render(<StoryFeed {...createBaseProps({ stories, hasMore: false })} />);

    expect(screen.getByRole('link', { name: /Sample story/i })).toHaveAttribute(
      'href',
      stories[0].url,
    );
    expect(screen.getByRole('link', { name: /Second story/i })).toHaveAttribute(
      'href',
      stories[1].url,
    );
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(2);
    expect(screen.getByText('You are all caught up.')).toBeInTheDocument();
  });

  it('switches to select mode in landscape layouts and highlights the active story', () => {
    const stories = [createStory({ id: 1 }), createStory({ id: 2, title: 'Highlighted story' })];
    const handleStorySelect = jest.fn();
    render(
      <StoryFeed
        {...createBaseProps({
          stories,
          isLandscape: true,
          selectedStoryId: 2,
          onStorySelect: handleStorySelect,
        })}
      />,
    );

    const buttons = [
      screen.getByRole('button', { name: /Sample story/i }),
      screen.getByRole('button', { name: /Highlighted story/i }),
    ];
    expect(buttons[0]).toHaveAttribute('aria-pressed', 'false');
    expect(buttons[1]).toHaveAttribute('aria-pressed', 'true');

    fireEvent.click(buttons[0]);
    expect(handleStorySelect).toHaveBeenCalledWith(stories[0]);
  });
});

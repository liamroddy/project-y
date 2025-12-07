/** @jest-environment jsdom */
import { jest } from '@jest/globals';
import { render, screen } from '@testing-library/react';

import type { Story } from '../../../types/hackerNews';
import { StoryCommentsPanel } from '../StoryCommentsPanel';

type UseStoryCommentsHook = (typeof import('../../../hooks/useStoryComments'))['useStoryComments'];
type StoryCommentsHookResult = ReturnType<UseStoryCommentsHook>;

function createStory(overrides: Partial<Story> = {}): Story {
  return {
    id: 10,
    by: 'eamonn',
    title: 'Comment-heavy story',
    score: 50,
    time: 1_700_000_000,
    type: 'story',
    kids: [1, 2, 3, 4],
    ...overrides,
  };
}

function createHookResult(
  overrides: Partial<StoryCommentsHookResult> = {},
): StoryCommentsHookResult {
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

describe('StoryCommentsPanel', () => {
  it('shows the empty-state when no story is selected', () => {
    const hookStub = jest.fn(() => createHookResult());

    render(<StoryCommentsPanel story={null} useStoryCommentsHook={hookStub} />);

    expect(hookStub).toHaveBeenCalledWith(null);
    expect(screen.getByText('No Story Selected')).toBeInTheDocument();
    expect(
      screen.getByText('Click on a story on the left to view its comments.'),
    ).toBeInTheDocument();
  });

  it('renders discussion details and loading state for a selected story', () => {
    const story = createStory();
    const hookStub = jest.fn(() =>
      createHookResult({
        hasMore: true,
        isValidating: true,
      }),
    );

    render(<StoryCommentsPanel story={story} useStoryCommentsHook={hookStub} />);

    expect(hookStub).toHaveBeenCalledWith(story);
    expect(screen.getByText('Discussion')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: story.title })).toBeInTheDocument();
    expect(screen.getByText(`by ${story.by}`)).toBeInTheDocument();
    expect(screen.getByText('Loading comments…')).toBeInTheDocument();
  });

  it('falls back to the unavailable state when threads cannot be loaded', () => {
    const story = createStory();
    const hookStub = jest.fn(() => createHookResult());

    render(<StoryCommentsPanel story={story} useStoryCommentsHook={hookStub} />);

    expect(screen.getByText('Comments unavailable')).toBeInTheDocument();
    expect(
      screen.getByText('Threads for this story are not available right now.'),
    ).toBeInTheDocument();
  });
});

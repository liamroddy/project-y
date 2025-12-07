/** @jest-environment jsdom */
import { jest } from '@jest/globals';
import { render, screen, fireEvent } from '@testing-library/react';
import type { Story } from '../../../types/hackerNews';

const { StoryCommentsContent } = await import('../StoryCommentsContent');

describe('StoryCommentsContent', () => {
  const story: Story = {
    id: 7,
    by: 'liam',
    title: 'A story on Hacker News',
    url: 'https://example.com/story',
    score: 420,
    time: 1_700_000_000,
    type: 'story',
  };

  it('renders the story header and default empty state when there are no comments', () => {
    render(
      <StoryCommentsContent
        story={story}
        comments={[]}
        error={null}
        totalThreads={0}
        resolvedCount={0}
        hasMore={false}
        showLoading={false}
        loadMore={jest.fn()}
      />,
    );

    expect(screen.getByText('Discussion')).toBeVisible();
    expect(screen.getByText(story.title)).toBeVisible();
    expect(screen.getByText(`by ${story.by}`)).toBeVisible();
    expect(screen.getByText('No comments yet')).toBeVisible();
    expect(screen.getByText('This story does not have any comments on Hacker News.')).toBeVisible();
    expect(screen.getByRole('link', { name: /open story in new tab/i })).toHaveAttribute(
      'href',
      story.url,
    );
  });

  it('shows the comments unavailable state when threads exist but none are available', () => {
    render(
      <StoryCommentsContent
        story={{ ...story, url: undefined }}
        comments={[]}
        error={null}
        totalThreads={8}
        resolvedCount={0}
        hasMore={false}
        showLoading={false}
        loadMore={jest.fn()}
      />,
    );

    expect(screen.getByText('Comments unavailable')).toBeVisible();
    expect(screen.getByText('Threads for this story are not available right now.')).toBeVisible();
    expect(screen.queryByRole('link', { name: /open story in new tab/i })).not.toBeInTheDocument();
  });

  it('renders the loading state while new comments are being fetched', () => {
    render(
      <StoryCommentsContent
        story={story}
        comments={[]}
        error={null}
        totalThreads={0}
        resolvedCount={0}
        hasMore={false}
        showLoading
        loadMore={jest.fn()}
      />,
    );

    expect(screen.getByText('Loading comments…')).toBeVisible();
  });

  it('renders the supplied error message when loading fails', () => {
    render(
      <StoryCommentsContent
        story={story}
        comments={[]}
        error="Failed to fetch comments"
        totalThreads={0}
        resolvedCount={0}
        hasMore={false}
        showLoading={false}
        loadMore={jest.fn()}
      />,
    );

    expect(screen.getByText('Failed to fetch comments')).toBeVisible();
  });

  it('stops event propagation when clicking the external link', () => {
    const parentClick = jest.fn();

    render(
      <div onClick={parentClick}>
        <StoryCommentsContent
          story={story}
          comments={[]}
          error={null}
          totalThreads={0}
          resolvedCount={0}
          hasMore={false}
          showLoading={false}
          loadMore={jest.fn()}
        />
      </div>,
    );

    const externalLink = screen.getByRole('link', { name: /open story in new tab/i });
    fireEvent.click(externalLink);
    expect(parentClick).not.toHaveBeenCalled();
  });
});

/** @jest-environment jsdom */
import { jest } from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react';

import type { Story } from '../../../types/hackerNews';
import { StoryCard } from '../StoryCard';

function createStory(overrides: Partial<Story> = {}): Story {
  return {
    id: 123,
    by: 'liam',
    title: 'Interesting story',
    url: 'https://example.com/story',
    score: 150,
    descendants: 10,
    time: 1_700_000_000,
    type: 'story',
    domain: 'example.com',
    kids: [1, 2],
    ...overrides,
  };
}

describe('StoryCard', () => {
  it('renders a link when in link mode', () => {
    const story = createStory();

    render(<StoryCard story={story} />);

    const link = screen.getByRole('link', { name: /Interesting story/i });
    expect(link).toHaveAttribute('href', story.url);
    expect(link).toHaveAttribute('target', '_blank');
  });

  it('falls back to the Hacker News item URL when no story URL is provided', () => {
    const story = createStory({ url: undefined });

    render(<StoryCard story={story} />);

    const link = screen.getByRole('link', { name: /Interesting story/i });
    expect(link).toHaveAttribute('href', 'https://news.ycombinator.com/item?id=123');
  });

  it('invokes onSelect when clicked in select mode', () => {
    const story = createStory();
    const handleSelect = jest.fn();

    render(<StoryCard story={story} mode="select" onSelect={handleSelect} />);

    fireEvent.click(screen.getByRole('button', { name: /Interesting story/i }));

    expect(handleSelect).toHaveBeenCalledWith(story);
  });

  it('does not trigger onSelect when the open-in-new action is clicked', () => {
    const story = createStory();
    const handleSelect = jest.fn();

    render(<StoryCard story={story} mode="select" onSelect={handleSelect} />);

    fireEvent.click(screen.getByRole('link', { name: /Open story in new tab/i }));

    expect(handleSelect).not.toHaveBeenCalled();
  });

  it('applies aria-pressed to reflect the active story', () => {
    const story = createStory();

    render(<StoryCard story={story} mode="select" isActive />);

    expect(screen.getByRole('button', { name: /Interesting story/i })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });
});

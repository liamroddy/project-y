/** @jest-environment jsdom */
import { jest } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import { StoryChipContainer } from '../StoryChipContainer';
import type { Story } from '../../../types/hackerNews';
import { formatRelativeTime } from '../../../utils/time';

describe('StoryChipContainer', () => {
  const baseStory: Story = {
    id: 42,
    by: 'liam',
    title: 'Making an alternative Hacker News front-end',
    score: 137,
    time: 1_700_000_000,
    type: 'story',
  };

  it('renders author, score, descendants fallback, and formatted time', () => {
    const fakeNow = baseStory.time * 1000 + 5 * 60 * 1000;
    const dateNowSpy = jest.spyOn(Date, 'now').mockReturnValue(fakeNow);

    try {
      const expectedRelativeTime = formatRelativeTime(baseStory.time);

      render(<StoryChipContainer story={baseStory} />);

      expect(screen.getByText(/by liam/i)).toBeVisible();
      expect(screen.getByText('137 points')).toBeVisible();
      expect(screen.getByText('0 comments')).toBeVisible();
      expect(screen.getByText(expectedRelativeTime)).toBeVisible();
    } finally {
      dateNowSpy.mockRestore();
    }
  });

  it('shows the provided descendants count when available', () => {
    render(<StoryChipContainer story={{ ...baseStory, descendants: 23 }} />);

    expect(screen.getByText('23 comments')).toBeVisible();
  });
});

/** @jest-environment jsdom */

import { render, screen } from '@testing-library/react';
import { StoryChip } from '../StoryChip';

describe('StoryChip', () => {
  it('renders the label along with any supplied icon', () => {
    render(<StoryChip label="Performance" icon={<span data-testid="chip-icon">🔥</span>} />);

    expect(screen.getByText('Performance')).toBeVisible();
    expect(screen.getByTestId('chip-icon')).toBeVisible();
  });
});

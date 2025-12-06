/** @jest-environment jsdom */

import { render, screen } from '@testing-library/react';
import { EmptyState } from '../EmptyState';

describe('EmptyState', () => {
  it('renders the provided title and description copy', () => {
    render(<EmptyState title="No stories yet" description="Try searching for something else." />);

    expect(screen.getByText('No stories yet')).toBeVisible();
    expect(screen.getByText('Try searching for something else.')).toBeVisible();
  });
});

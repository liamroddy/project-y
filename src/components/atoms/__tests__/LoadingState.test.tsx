/** @jest-environment jsdom */

import { render, screen } from '@testing-library/react';
import { LoadingState } from '../LoadingState';

describe('LoadingState', () => {
  it('shows the default loading label when no label is provided', () => {
    render(<LoadingState />);

    expect(screen.getByText('Loading…')).toBeVisible();
    expect(screen.getByRole('progressbar')).toBeVisible();
  });

  it('renders a custom label when supplied', () => {
    render(<LoadingState label="Fetching newest stories" />);

    expect(screen.getByText('Fetching newest stories')).toBeVisible();
    expect(screen.getByRole('progressbar')).toBeVisible();
  });
});

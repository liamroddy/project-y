/** @jest-environment jsdom */

import { jest } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import { CommentHeader } from '../CommentHeader';

describe('CommentHeader', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders the author name along with the formatted relative time', () => {
    jest.spyOn(Date, 'now').mockReturnValue(1_700_000_000_000 + 10 * 60 * 1000);
    render(<CommentHeader author="liam" time={1_700_000_000} />);

    expect(screen.getByText('liam')).toBeVisible();
    expect(screen.getByText('10m ago')).toBeVisible();
  });

  it('reflects different timestamps in the rendered relative time', () => {
    jest.spyOn(Date, 'now').mockReturnValue(1_700_000_003_000 + 2 * 1000);
    render(<CommentHeader author="roddy" time={1_700_000_003} />);

    expect(screen.getByText('roddy')).toBeVisible();
    expect(screen.getByText('2s ago')).toBeVisible();
  });
});

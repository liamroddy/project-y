/** @jest-environment jsdom */
import { render, screen } from '@testing-library/react';

import { AppHeader } from '../AppHeader';

describe('AppHeader', () => {
  it('renders the product title and tagline', () => {
    render(<AppHeader />);

    expect(screen.getByRole('heading', { name: 'Hacker News++' })).toBeInTheDocument();
    expect(screen.getByText('A modern Hacker News front-end.')).toBeInTheDocument();
  });

  it('marks the decorative Y badge as aria-hidden', () => {
    render(<AppHeader />);

    expect(screen.getByText('Y')).toHaveAttribute('aria-hidden', 'true');
  });
});

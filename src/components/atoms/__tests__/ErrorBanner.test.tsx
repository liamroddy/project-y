/** @jest-environment jsdom */

import { render, screen } from '@testing-library/react';
import { ErrorBanner } from '../ErrorBanner';

describe('ErrorBanner', () => {
  it('renders the provided message inside an alert role', () => {
    render(<ErrorBanner message="Something went wrong." />);

    const alert = screen.getByRole('alert');
    expect(alert).toBeVisible();
    expect(alert).toHaveTextContent('Something went wrong.');
  });
});

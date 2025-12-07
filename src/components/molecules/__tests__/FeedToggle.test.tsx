/** @jest-environment jsdom */
import { jest } from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react';
import { FeedToggle } from '../FeedToggle';

describe('FeedToggle', () => {
  it('calls onChange when new is selected', () => {
    const handleChange = jest.fn();

    render(<FeedToggle value="top" onChange={handleChange} />);

    fireEvent.click(screen.getByRole('button', { name: /new/i }));

    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith('new');
  });

  it('calls onChange when top is selected', () => {
    const handleChange = jest.fn();

    render(<FeedToggle value="new" onChange={handleChange} />);

    fireEvent.click(screen.getByRole('button', { name: /top/i }));

    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith('top');
  });

  it('ignores toggle events that would result in a null selection', () => {
    const handleChange = jest.fn();

    render(<FeedToggle value="top" onChange={handleChange} />);

    fireEvent.click(screen.getByRole('button', { name: /top/i }));

    expect(handleChange).not.toHaveBeenCalled();
  });
});

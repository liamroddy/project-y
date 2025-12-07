/** @jest-environment jsdom */
import { render, screen } from '@testing-library/react';
import type { CommentNode } from '../../../types/hackerNews';
import { StoryComment } from '../StoryComment';

describe('StoryComment', () => {
  const baseComment: CommentNode = {
    id: 1,
    by: 'liam',
    text: '<p>Hello world</p>',
    time: Math.floor(Date.now() / 1000),
    type: 'comment',
    parent: 0,
  };

  it('renders sanitized comment text when available', () => {
    const comment: CommentNode = {
      ...baseComment,
      text: '<script>alert(1)</script><p>Trusted content</p>',
    };

    render(<StoryComment comment={comment} />);

    expect(screen.getByText('Trusted content')).toBeVisible();
    expect(screen.queryByText('alert(1)')).not.toBeInTheDocument();
  });

  it('shows a placeholder when the comment text or username is missing', () => {
    render(<StoryComment comment={{ ...baseComment, text: undefined, by: undefined }} />);

    expect(screen.getByText('[comment unavailable]')).toBeVisible();
    expect(screen.getByText(/anonymous/i)).toBeVisible();
  });

  it('renders child comments recursively', () => {
    const nestedComment: CommentNode = {
      ...baseComment,
      id: 2,
      text: 'Child reply',
      children: undefined,
    };

    const parent: CommentNode = {
      ...baseComment,
      text: 'Parent comment',
      children: [nestedComment],
    };

    render(<StoryComment comment={parent} />);

    expect(screen.getByText('Parent comment')).toBeVisible();
    expect(screen.getByText('Child reply')).toBeVisible();
  });
});

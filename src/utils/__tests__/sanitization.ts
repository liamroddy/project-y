/** @jest-environment jsdom */

import { sanitizeCommentHtml } from '../sanitization';

describe('sanitizeCommentHtml', () => {
  it('returns an empty string when text is missing', () => {
    expect(sanitizeCommentHtml(undefined)).toBe('');
    expect(sanitizeCommentHtml(null)).toBe('');
  });

  it('removes executable content while preserving safe markup', () => {
    const dirty =
      "<p>Hello<script>alert('xss')</script><img src=x onerror=alert('boom') /><code>const x = 1;</code></p>";

    const sanitized = sanitizeCommentHtml(dirty);

    expect(sanitized).toContain('<p>Hello');
    expect(sanitized).toContain('<code>const x = 1;</code>');
    expect(sanitized).not.toContain('<script');
    expect(sanitized).not.toContain('alert(');
    expect(sanitized).not.toContain('onerror');
  });

  it('retains safe anchor attributes and strips handlers', () => {
    const linkHtml =
      '<a href="https://example.com" rel="noopener" target="_blank" title="Example" onclick="alert(1)">link</a>';

    const sanitized = sanitizeCommentHtml(linkHtml);

    expect(sanitized).toContain('href="https://example.com"');
    expect(sanitized).toContain('rel="noopener"');
    expect(sanitized).toContain('title="Example"');
    expect(sanitized).not.toContain('onclick');
  });
});

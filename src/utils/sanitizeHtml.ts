import DOMPurify from 'dompurify';

const sanitizerConfig = {
  ALLOWED_TAGS: [
    'a',
    'blockquote',
    'br',
    'code',
    'em',
    'i',
    'li',
    'ol',
    'p',
    'pre',
    'strong',
    'ul',
  ],
  ALLOWED_ATTR: ['href', 'rel', 'target', 'title'],
  USE_PROFILES: { html: true },
};

export function sanitizeCommentHtml(text?: string | null) {
  if (!text) {
    return '';
  }

  return DOMPurify.sanitize(text, sanitizerConfig);
}

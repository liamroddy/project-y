import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { CommentNode } from '../../types/hackerNews';
import { formatRelativeTime } from '../../utils/time';

interface StoryCommentProps {
  comment: CommentNode;
  depth?: number;
}

export function StoryComment({ comment, depth = 0 }: StoryCommentProps) {
  const author = comment.by ?? 'anonymous';

  return (
    <Box
      sx={{
        pl: depth ? 2 : 0,
        borderLeft: depth ? '1px solid' : 'none',
        borderColor: 'divider',
      }}
    >
      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
        {author}
        <Typography
          component="span"
          variant="caption"
          color="text.secondary"
          sx={{ ml: 1 }}
        >
          {formatRelativeTime(comment.time)}
        </Typography>
      </Typography>
      {comment.text ? (
        <Typography
          variant="body2"
          component="div"
          sx={{
            mt: 1,
            '& p': { mt: 0, mb: 1 },
            '& code': {
              fontFamily: 'inherit',
              px: 0.5,
              py: 0.25,
              borderRadius: 1,
              backgroundColor: 'rgba(255,255,255,0.08)',
            },
            '& a': { color: 'primary.light' },
          }}
          dangerouslySetInnerHTML={{ __html: comment.text }}
        />
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          [comment unavailable]
        </Typography>
      )}
      {comment.children?.length ? (
        <Stack spacing={2} sx={{ mt: 2 }}>
          {comment.children.map((child) => (
            <StoryComment key={child.id} comment={child} depth={depth + 1} />
          ))}
        </Stack>
      ) : null}
    </Box>
  );
}

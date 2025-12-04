import LaunchIcon from '@mui/icons-material/Launch';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import type { Story } from '../../types/hackerNews';
import { useStoryComments } from '../../hooks/useStoryComments';

import { EmptyState } from '../atoms/EmptyState';
import { ErrorBanner } from '../atoms/ErrorBanner';
import { LoadingState } from '../atoms/LoadingState';
import { StoryComment } from '../molecules/StoryComment';

export interface StoryCommentSectionProps {
  story: Story;
}

export function StoryCommentSection({ story }: StoryCommentSectionProps) {
  const { comments, isLoading, error } = useStoryComments(story.id);

  return (
    <Box
      sx={{
        height: '100%',
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        backgroundColor: 'rgba(15,23,42,0.6)',
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
      }}
    >
      <Stack direction="row" spacing={2} alignItems="flex-start">
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="overline" color="text.secondary">
            Discussion
          </Typography>
          <Typography variant="h6" component="h3">
            {story.title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            by {story.by}
          </Typography>
        </Box>
        {story.url ? (
          <Tooltip title="Open story in new tab">
            <IconButton
              size="small"
              component="a"
              href={story.url}
              target="_blank"
              rel="noreferrer"
              onClick={(event) => {
                event.stopPropagation();
              }}
            >
              <LaunchIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        ) : null}
      </Stack>
      <Divider sx={{ my: 2 }} />
      <Box sx={{ flexGrow: 1, overflowY: 'auto', pr: 1 }}>
        {isLoading ? (
          <LoadingState label="Loading comments…" />
        ) : error ? (
          <ErrorBanner message={error} />
        ) : comments.length ? (
          <Stack spacing={3}>
            {comments.map((comment) => (
              <StoryComment key={comment.id} comment={comment} />
            ))}
          </Stack>
        ) : (
          <EmptyState
            title="No comments yet"
            description="This story does not have any comments on Hacker News."
          />
        )}
      </Box>
    </Box>
  );
}

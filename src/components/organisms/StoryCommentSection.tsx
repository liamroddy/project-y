import LaunchIcon from '@mui/icons-material/Launch';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import InfiniteScroll from 'react-infinite-scroll-component';

import type { Story } from '../../types/hackerNews';
import { useStoryComments } from '../../hooks/useStoryComments';

import { EmptyState } from '../atoms/EmptyState';
import { ErrorBanner } from '../atoms/ErrorBanner';
import { LoadingState } from '../atoms/LoadingState';
import { StoryComment } from '../molecules/StoryComment';

interface StoryCommentSectionProps {
  story: Story;
}

const COMMENTS_SCROLL_CONTAINER_ID = 'story-comments-scroll-container';

export function StoryCommentSection({ story }: StoryCommentSectionProps) {
  const { comments, error, hasMore, isLoadingInitial, loadMore, resolvedCount } =
    useStoryComments(story);
  const totalThreads = story.kids?.length ?? 0;
  const shouldShowLoading = isLoadingInitial || (comments.length === 0 && hasMore);

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
      <Box id={COMMENTS_SCROLL_CONTAINER_ID} sx={{ flexGrow: 1, overflowY: 'auto', pr: 1 }}>
        {shouldShowLoading ? (
          <LoadingState label="Loading comments…" />
        ) : error ? (
          <ErrorBanner message={error} />
        ) : comments.length ? (
          <InfiniteScroll
            dataLength={resolvedCount}
            next={() => {
              loadMore();
            }}
            hasMore={hasMore}
            scrollableTarget={COMMENTS_SCROLL_CONTAINER_ID}
            loader={<LoadingState label="Loading more comments…" />}
            scrollThreshold={0.8}
            style={{ overflow: 'visible' }}
          >
            <Stack spacing={3}>
              {comments.map((comment) => (
                <StoryComment key={comment.id} comment={comment} />
              ))}
            </Stack>
          </InfiniteScroll>
        ) : (
          <EmptyState
            title={totalThreads ? 'Comments unavailable' : 'No comments yet'}
            description={
              totalThreads
                ? 'Threads for this story are not available right now.'
                : 'This story does not have any comments on Hacker News.'
            }
          />
        )}
      </Box>
    </Box>
  );
}

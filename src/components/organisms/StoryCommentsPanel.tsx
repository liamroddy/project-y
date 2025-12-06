import Box from '@mui/material/Box';

import type { Story } from '../../types/hackerNews';
import { useStoryComments } from '../../hooks/useStoryComments';
import { EmptyState } from '../atoms/EmptyState';
import { StoryCommentsContent } from '../molecules/StoryCommentsContent';

interface StoryCommentsPanelProps {
  story: Story | null;
}

export function StoryCommentsPanel({ story }: StoryCommentsPanelProps) {
  const { comments, error, hasMore, isLoadingInitial, isValidating, loadMore, resolvedCount } =
    useStoryComments(story);
  const totalThreads = story?.kids?.length ?? 0;
  const shouldShowLoading =
    !error && (isLoadingInitial || (isValidating && comments.length === 0 && hasMore));

  if (!story) {
    return (
      <Box
        sx={{
          height: '100%',
          borderRadius: 3,
          border: '1px dashed',
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: 2,
          textAlign: 'center',
        }}
      >
        <EmptyState
          title="No Story Selected"
          description="Click on a story on the left to view its comments."
        />
      </Box>
    );
  }

  return (
    <StoryCommentsContent
      story={story}
      comments={comments}
      error={error}
      totalThreads={totalThreads}
      resolvedCount={resolvedCount}
      hasMore={hasMore}
      showLoading={shouldShowLoading}
      loadMore={loadMore}
    />
  );
}

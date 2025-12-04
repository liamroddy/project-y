import Box from '@mui/material/Box';

import type { Story } from '../../types/hackerNews';

import { EmptyState } from '../atoms/EmptyState';
import { StoryCommentSection } from './StoryCommentSection';

interface StoryCommentsPanelProps {
  story: Story | null;
}

export function StoryCommentsPanel({ story }: StoryCommentsPanelProps) {
  const renderEmptyState = () => (
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

  return !story ? renderEmptyState() : <StoryCommentSection story={story} />;
}

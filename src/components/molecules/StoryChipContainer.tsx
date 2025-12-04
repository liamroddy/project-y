import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import ScheduleIcon from '@mui/icons-material/Schedule';
import WhatshotIcon from '@mui/icons-material/Whatshot';

import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import type { Story } from '../../types/hackerNews';
import { formatRelativeTime } from '../../utils/time';
import { StoryChip } from '../atoms/StoryChip';

interface StoryChipContainerProps {
  story: Story;
}

export function StoryChipContainer({ story }: StoryChipContainerProps) {
  return (
    <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center">
      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
        by {story.by}
      </Typography>
      <StoryChip icon={<WhatshotIcon fontSize="small" />} label={`${String(story.score)} points`} />
      <StoryChip
        icon={<ChatBubbleOutlineIcon fontSize="small" />}
        label={`${String(story.descendants ?? 0)} comments`}
      />
      <StoryChip icon={<ScheduleIcon fontSize="small" />} label={formatRelativeTime(story.time)} />
    </Stack>
  );
}

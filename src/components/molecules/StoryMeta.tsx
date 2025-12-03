import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import ScheduleIcon from '@mui/icons-material/Schedule';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { Story } from '../../types/hackerNews';
import { formatRelativeTime } from '../../utils/time';
import { StoryMetaItem } from '../atoms/StoryMetaItem';

interface StoryMetaProps {
  story: Story;
}

export function StoryMeta({ story }: StoryMetaProps) {
  return (
    <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center">
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ fontWeight: 500 }}
      >
        by {story.by}
      </Typography>
      <StoryMetaItem
        icon={<WhatshotIcon fontSize="small" />}
        label={`${story.score} points`}
      />
      <StoryMetaItem
        icon={<ChatBubbleOutlineIcon fontSize="small" />}
        label={`${story.descendants ?? 0} comments`}
      />
      <StoryMetaItem
        icon={<ScheduleIcon fontSize="small" />}
        label={formatRelativeTime(story.time)}
      />
    </Stack>
  );
}

import LaunchIcon from '@mui/icons-material/Launch';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { Story } from '../../types/hackerNews';
import { StoryMeta } from '../molecules/StoryMeta';

interface StoryCardProps {
  story: Story;
}

export function StoryCard({ story }: StoryCardProps) {
  const targetUrl =
    story.url ?? `https://news.ycombinator.com/item?id=${story.id}`;

  return (
    <Card
      elevation={0}
      sx={{
        minHeight: 140,
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        backgroundImage: 'none',
      }}
    >
      <CardActionArea
        component="a"
        href={targetUrl}
        target="_blank"
        rel="noreferrer"
        sx={{ height: '100%', alignItems: 'stretch' }}
      >
        <CardContent sx={{ height: '100%' }}>
          <Stack spacing={1.5}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="h6" component="h3" sx={{ flexGrow: 1 }}>
                {story.title}
              </Typography>
              <LaunchIcon color="primary" fontSize="small" />
            </Stack>
            {story.domain && (
              <Chip
                size="small"
                icon={<OpenInNewIcon fontSize="small" />}
                label={story.domain}
                variant="outlined"
                sx={{ alignSelf: 'flex-start' }}
              />
            )}
            <StoryMeta story={story} />
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

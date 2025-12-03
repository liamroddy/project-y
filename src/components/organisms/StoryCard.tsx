import LaunchIcon from '@mui/icons-material/Launch';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import type { Story } from '../../types/hackerNews';
import { StoryMeta } from '../molecules/StoryMeta';

interface StoryCardProps {
  story: Story;
  mode?: 'link' | 'select';
  onSelect?: (story: Story) => void;
  isActive?: boolean;
}

export function StoryCard({
  story,
  mode = 'link',
  onSelect,
  isActive = false,
}: StoryCardProps) {
  const targetUrl =
    story.url ?? `https://news.ycombinator.com/item?id=${story.id}`;

  const actionProps =
    mode === 'link'
      ? {
          component: 'a',
          href: targetUrl,
          target: '_blank',
          rel: 'noreferrer',
        }
      : {
          onClick: () => {
            onSelect?.(story);
          },
          'aria-pressed': isActive,
        };

  return (
    <Card
      elevation={0}
      sx={{
        minHeight: 140,
        borderRadius: 3,
        border: '1px solid',
        borderColor: isActive ? 'primary.main' : 'divider',
        backgroundImage: 'none',
        backgroundColor: isActive ? 'rgba(59,130,246,0.1)' : 'transparent',
        transition: 'border-color 150ms ease, background-color 150ms ease',
      }}
    >
      <CardActionArea
        sx={{ height: '100%', alignItems: 'stretch' }}
        {...actionProps}
      >
        <CardContent sx={{ height: '100%' }}>
          <Stack spacing={1.5}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="h6" component="h3" sx={{ flexGrow: 1 }}>
                {story.title}
              </Typography>
              {mode === 'select' ? (
                <Tooltip title="Open story in new tab">
                  <IconButton
                    size="small"
                    component="a"
                    href={targetUrl}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(event) => {
                      event.stopPropagation();
                    }}
                  >
                    <LaunchIcon fontSize="small" color="primary" />
                  </IconButton>
                </Tooltip>
              ) : (
                <LaunchIcon color="primary" fontSize="small" />
              )}
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

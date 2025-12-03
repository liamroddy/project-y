import AppBar from '@mui/material/AppBar';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import type { StoryFeedSort } from '../../types/hackerNews';
import { FeedToggle } from '../atoms/FeedToggle';

interface StoriesHeaderProps {
  feedType: StoryFeedSort;
  onFeedChange: (feed: StoryFeedSort) => void;
}

export function StoriesHeader({ feedType, onFeedChange }: StoriesHeaderProps) {
  return (
    <AppBar
      position="sticky"
      elevation={0}
      color="transparent"
      sx={{
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Toolbar disableGutters>
        <Container maxWidth="md">
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            justifyContent="space-between"
            spacing={1}
            py={1}
          >
            <div>
              <Typography variant="h4" component="h1">
                Hacker News++
              </Typography>
              <Typography variant="body1" color="text.secondary">
                A modern Hacker News front-end.
              </Typography>
            </div>
            <FeedToggle value={feedType} onChange={onFeedChange} />
          </Stack>
        </Container>
      </Toolbar>
    </AppBar>
  );
}

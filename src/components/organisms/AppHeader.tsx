import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';

import type { StoryFeedSort } from '../../types/hackerNews';
import { FeedToggle } from '../atoms/FeedToggle';

interface AppHeader {
  feedType: StoryFeedSort;
  onFeedChange: (feed: StoryFeedSort) => void;
}

function renderYLogo() {
  return (
    <Box
      sx={{
        backgroundColor: (theme) => theme.palette.primary.main,
        color: (theme) => theme.palette.background.header,
        borderRadius: 1.5,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        aspectRatio: '1',
        fontWeight: 800,
        fontSize: { xs: '2.5rem', sm: '3rem' },
        lineHeight: 1,
        px: 1.5,
      }}
      aria-hidden
    >
      Y
    </Box>
  );
}

export function AppHeader({ feedType, onFeedChange }: AppHeader) {
  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor: (theme) => theme.palette.background.header,
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
            <Stack className="title-stack" direction="row" spacing={2} alignItems="stretch">
              {renderYLogo()}
              <div>
                <Typography variant="h4" component="h1">
                  Hacker News++
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  A modern Hacker News front-end.
                </Typography>
              </div>
            </Stack>
            <FeedToggle value={feedType} onChange={onFeedChange} />
          </Stack>
        </Container>
      </Toolbar>
    </AppBar>
  );
}

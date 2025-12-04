import { useCallback, useEffect, useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import useMediaQuery from '@mui/material/useMediaQuery';
import { alpha } from '@mui/material/styles';

import { useStoriesFeed } from '../../hooks/useStoriesFeed';
import type { Story } from '../../types/hackerNews';

import { ErrorBanner } from '../atoms/ErrorBanner';
import { AppHeader } from '../organisms/AppHeader';
import { StoryCommentsPanel } from '../organisms/StoryCommentsPanel';
import { StoryFeed } from '../organisms/StoryFeed';
import { theme } from '../../theme';

export function FrontPage() {
  const { feedType, setFeedType, stories, hasMore, isInitializing, error, loadMore } =
    useStoriesFeed('top');

  const [selectedStoryId, setSelectedStoryId] = useState<number | null>(null);
  const isLandscape = useMediaQuery('(orientation: landscape)');

  useEffect(() => {
    if (!isLandscape && selectedStoryId != null) {
      setSelectedStoryId(null);
    }
  }, [isLandscape, selectedStoryId]);

  useEffect(() => {
    setSelectedStoryId(null);
  }, [feedType]);

  const selectedStory = useMemo(() => {
    if (selectedStoryId == null) {
      return null;
    }

    return stories.find((story) => story.id === selectedStoryId) ?? null;
  }, [selectedStoryId, stories]);

  const handleStorySelect = useCallback((story: Story) => {
    setSelectedStoryId(story.id);
  }, []);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(180deg, ${theme.palette.background.default} 0%, ${alpha(theme.palette.background.default, 0.9)} 100%)`,
        color: 'text.primary',
      }}
    >
      <AppHeader feedType={feedType} onFeedChange={setFeedType} />
      <Container
        maxWidth={false}
        sx={{
          width: '100%',
          mx: 'auto',
          pt: 3,
          pb: 6,
          px: { xs: 2, sm: 3, lg: 4 },
          display: 'flex',
          flexDirection: 'column',
          height: 'calc(100vh - 80px)',
        }}
      >
        {Boolean(error) && !isInitializing ? <ErrorBanner message={String(error)} /> : null}
        <Stack
          direction={isLandscape ? 'row' : 'column'}
          spacing={isLandscape ? 3 : 0}
          sx={{
            mt: 2,
            flexGrow: 1,
            minHeight: 0,
            width: '100%',
            mx: isLandscape ? 0 : 'auto',
          }}
        >
          <Box
            sx={{
              flex: isLandscape ? '0 0 33%' : '1 1 auto',
              maxWidth: isLandscape ? '33%' : '100%',
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0,
              minWidth: 0,
            }}
          >
            <StoryFeed
              feedType={feedType}
              stories={stories}
              hasMore={hasMore}
              isInitializing={isInitializing}
              loadMore={loadMore}
              isLandscape={isLandscape}
              selectedStoryId={selectedStoryId}
              onStorySelect={handleStorySelect}
            />
          </Box>
          {isLandscape ? (
            <Box
              sx={{
                flex: '0 0 67%',
                maxWidth: '67%',
                minHeight: 0,
                minWidth: 0,
              }}
            >
              <StoryCommentsPanel story={selectedStory} />
            </Box>
          ) : null}
        </Stack>
      </Container>
    </Box>
  );
}

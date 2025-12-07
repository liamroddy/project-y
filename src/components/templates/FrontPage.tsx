import { useCallback, useEffect, useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import useMediaQuery from '@mui/material/useMediaQuery';
import { alpha } from '@mui/material/styles';

import { useStoriesFeed } from '../../hooks/useStoriesFeed';
import type { Story } from '../../types/hackerNews';

import { ErrorBanner } from '../atoms/ErrorBanner';
import { FeedToggle } from '../molecules/FeedToggle';
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

  const handleStoryDeselect = useCallback(() => {
    setSelectedStoryId(null);
  }, []);

  const isStorySelected = Boolean(selectedStory);
  const showStoryFeed = isLandscape || !isStorySelected;
  const showCommentsPanel = isLandscape || isStorySelected;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(180deg, ${theme.palette.background.default} 0%, ${alpha(theme.palette.background.default, 0.9)} 100%)`,
        color: 'text.primary',
      }}
    >
      <AppHeader />
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
            flexGrow: 1,
            minHeight: 0,
            width: '100%',
            mx: isLandscape ? 0 : 'auto',
          }}
        >
          <Box
            className="story-feed-container"
            sx={{
              flex: isLandscape ? '0 0 33%' : showStoryFeed ? '1 1 0%' : '0 0 auto',
              maxWidth: isLandscape ? '33%' : '100%',
              display: showStoryFeed ? 'flex' : 'none',
              flexDirection: 'column',
              minHeight: 0,
              minWidth: 0,
            }}
          >
            <Box
              className="feed-toggle-container"
              sx={(theme) => ({
                flexShrink: 0,
                position: 'sticky',
                top: 0,
                zIndex: 2,
                py: 1.5,
                pr: { xs: 0, sm: 1 },
                display: 'flex',
                justifyContent: 'center',
                background: `linear-gradient(180deg, ${theme.palette.background.default} 0%, ${alpha(
                  theme.palette.background.default,
                  0.95,
                )} 50%, ${alpha(theme.palette.background.default, 0)} 100%)`,
                overflow: 'visible',
              })}
            >
              <FeedToggle value={feedType} onChange={setFeedType} />
              <Box
                aria-hidden
                sx={(theme) => ({
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: '100%',
                  height: theme.spacing(6),
                  backgroundImage: `linear-gradient(180deg, ${alpha(
                    theme.palette.background.default,
                    0.95,
                  )} 0%, ${alpha(theme.palette.background.default, 0)} 100%)`,
                  pointerEvents: 'none',
                })}
              />
            </Box>
            {showStoryFeed ? (
              <StoryFeed
                feedType={feedType}
                stories={stories}
                hasMore={hasMore}
                isInitializing={isInitializing}
                loadMore={loadMore}
                selectedStoryId={selectedStoryId}
                onStorySelect={handleStorySelect}
              />
            ) : null}
          </Box>
          {showCommentsPanel ? (
            <Box
              sx={{
                flex: isLandscape ? '0 0 67%' : '1 1 0%',
                maxWidth: isLandscape ? '67%' : '100%',
                minHeight: 0,
                minWidth: 0,
                display: 'flex',
                width: '100%',
                overflow: 'hidden',
              }}
            >
              <StoryCommentsPanel
                story={selectedStory}
                hasBackButton={!isLandscape}
                onBack={!isLandscape ? handleStoryDeselect : undefined}
              />
            </Box>
          ) : null}
        </Stack>
      </Container>
    </Box>
  );
}

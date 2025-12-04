import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import InfiniteScroll from 'react-infinite-scroll-component';

import { useStoriesFeed } from '../../hooks/useStoriesFeed';
import type { Story } from '../../types/hackerNews';

import { EmptyState } from '../atoms/EmptyState';
import { ErrorBanner } from '../atoms/ErrorBanner';
import { LoadingState } from '../atoms/LoadingState';
import { StoriesHeader } from './StoriesHeader';
import { StoryCard } from './StoryCard';
import { StoryCommentsPanel } from './StoryCommentsPanel';

const SCROLL_CONTAINER_ID = 'stories-scroll-container';
const ROW_HEIGHT = 170;
const BUFFER_ROWS = 5;
const PORTRAIT_CONTENT_WIDTH = 520;
export function StoriesFeed() {
  const { feedType, setFeedType, stories, hasMore, isInitializing, error, loadMore } =
    useStoriesFeed('top');

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  const [selectedStoryId, setSelectedStoryId] = useState<number | null>(null);
  const isLandscape = useMediaQuery('(orientation: landscape)');
  const cardMode = isLandscape ? 'select' : 'link';

  useLayoutEffect(() => {
    const element = scrollContainerRef.current;
    if (!element) {
      return;
    }

    const updateHeight = () => {
      setContainerHeight(element.clientHeight);
    };

    updateHeight();

    const resizeObserver = new ResizeObserver(() => {
      updateHeight();
    });
    resizeObserver.observe(element);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    const element = scrollContainerRef.current;
    if (!element) {
      return;
    }

    const handleScroll = () => {
      setScrollTop(element.scrollTop);
    };

    element.addEventListener('scroll', handleScroll);
    return () => {
      element.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    // Reset scroll position when feed changes
    const element = scrollContainerRef.current;
    if (element) {
      element.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [feedType]);

  useEffect(() => {
    setSelectedStoryId(null);
  }, [feedType]);

  useEffect(() => {
    if (!isLandscape && selectedStoryId != null) {
      setSelectedStoryId(null);
    }
  }, [isLandscape, selectedStoryId]);

  const virtualizedStories = useMemo(() => {
    const totalHeight = stories.length * ROW_HEIGHT;
    const visibleRowCount = Math.ceil(containerHeight / ROW_HEIGHT) + BUFFER_ROWS * 2;
    const startIndex = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - BUFFER_ROWS);
    const endIndex = Math.min(stories.length, startIndex + visibleRowCount);
    const offsetY = startIndex * ROW_HEIGHT;

    const visibleStories = stories.slice(startIndex, endIndex);

    return { totalHeight, offsetY, visibleStories };
  }, [containerHeight, scrollTop, stories]);

  const selectedStory = useMemo(() => {
    if (selectedStoryId == null) {
      return null;
    }

    return stories.find((story) => story.id === selectedStoryId) ?? null;
  }, [selectedStoryId, stories]);

  const handleStorySelect = useCallback((story: Story) => {
    setSelectedStoryId(story.id);
  }, []);

  const renderContent = () => {
    if (isInitializing) {
      return <LoadingState label="Loading the latest stories…" />;
    }

    if (!stories.length) {
      return (
        <EmptyState
          title="No stories yet"
          description="Try switching feeds or refreshing the page."
        />
      );
    }

    return (
      <InfiniteScroll
        dataLength={stories.length}
        next={() => {
          void loadMore();
        }}
        hasMore={hasMore}
        loader={<LoadingState label="Loading additional stories…" />}
        scrollableTarget={SCROLL_CONTAINER_ID}
        style={{ overflow: 'visible' }}
        endMessage={
          <Typography variant="body2" color="text.secondary" textAlign="center" py={3}>
            You are all caught up.
          </Typography>
        }
      >
        <Box
          sx={{
            height: virtualizedStories.totalHeight || ROW_HEIGHT,
            position: 'relative',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              left: 0,
              right: 0,
              transform: `translateY(${String(virtualizedStories.offsetY)}px)`,
            }}
          >
            <Stack spacing={2.5}>
              {virtualizedStories.visibleStories.map((story: Story) => (
                <StoryCard
                  key={story.id}
                  story={story}
                  mode={cardMode}
                  onSelect={isLandscape ? handleStorySelect : undefined}
                  isActive={isLandscape ? selectedStoryId === story.id : false}
                />
              ))}
            </Stack>
          </Box>
        </Box>
      </InfiniteScroll>
    );
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, rgba(15,23,42,1) 0%, rgba(15,23,42,0.9) 100%)',
        color: 'text.primary',
      }}
    >
      <StoriesHeader feedType={feedType} onFeedChange={setFeedType} />
      <Container
        maxWidth={false}
        sx={{
          width: '100%',
          maxWidth: isLandscape ? 1600 : PORTRAIT_CONTENT_WIDTH,
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
            width: isLandscape ? '100%' : PORTRAIT_CONTENT_WIDTH,
            maxWidth: '100%',
            mx: isLandscape ? 0 : 'auto',
          }}
        >
          <Box
            sx={{
              flex: isLandscape ? '0 0 33.3333%' : '1 1 auto',
              maxWidth: isLandscape ? '33.3333%' : '100%',
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0,
              minWidth: 0,
            }}
          >
            <Box
              id={SCROLL_CONTAINER_ID}
              ref={scrollContainerRef}
              sx={{
                flexGrow: 1,
                overflowY: 'auto',
                pr: { xs: 0, sm: 1 },
              }}
            >
              {renderContent()}
            </Box>
          </Box>
          {isLandscape ? (
            <Box
              sx={{
                flex: '0 0 66.6667%',
                maxWidth: '66.6667%',
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

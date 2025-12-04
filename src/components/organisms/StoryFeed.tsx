import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import InfiniteScroll from 'react-infinite-scroll-component';

import type { Story, StoryFeedSort } from '../../types/hackerNews';
import { EmptyState } from '../atoms/EmptyState';
import { LoadingState } from '../atoms/LoadingState';
import { StoryCard } from '../organisms/StoryCard';

const SCROLL_CONTAINER_ID = 'stories-scroll-container';
const ROW_HEIGHT = 170;
const BUFFER_ROWS = 5;

interface StoryFeedProps {
  feedType: StoryFeedSort;
  stories: Story[];
  hasMore: boolean;
  isInitializing: boolean;
  loadMore: () => void | Promise<void>;
  isLandscape: boolean;
  selectedStoryId: number | null;
  onStorySelect?: (story: Story) => void;
}

export function StoryFeed({
  feedType,
  stories,
  hasMore,
  isInitializing,
  loadMore,
  isLandscape,
  selectedStoryId,
  onStorySelect,
}: StoryFeedProps) {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);

  useLayoutEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) {
      return;
    }

    const updateHeight = () => {
      setContainerHeight(scrollContainer.clientHeight);
    };

    updateHeight();

    const resizeObserver = new ResizeObserver(() => {
      updateHeight();
    });

    resizeObserver.observe(scrollContainer);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) {
      return;
    }

    const handleScroll = () => {
      setScrollTop(scrollContainer.scrollTop);
    };

    scrollContainer.addEventListener('scroll', handleScroll);

    return () => {
      scrollContainer.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) {
      return;
    }

    scrollContainer.scrollTop = 0;
    setScrollTop(0);
  }, [feedType]);

  const virtualizedStories = useMemo(() => {
    const totalHeight = stories.length * ROW_HEIGHT;
    const visibleRowCount = Math.ceil(containerHeight / ROW_HEIGHT) + BUFFER_ROWS * 2;
    const startIndex = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - BUFFER_ROWS);
    const endIndex = Math.min(stories.length, startIndex + visibleRowCount);
    const offsetY = startIndex * ROW_HEIGHT;
    const visibleStories = stories.slice(startIndex, endIndex);

    return { totalHeight, offsetY, visibleStories };
  }, [containerHeight, scrollTop, stories]);

  const renderFeed = () => {
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

    const cardMode = isLandscape ? 'select' : 'link';
    const handleSelect = isLandscape ? onStorySelect : undefined;

    return (
      <InfiniteScroll
        key={feedType}
        dataLength={stories.length}
        next={() => {
          void loadMore();
        }}
        hasMore={hasMore}
        scrollThreshold={0.8}
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
              {virtualizedStories.visibleStories.map((story) => (
                <StoryCard
                  key={story.id}
                  story={story}
                  mode={cardMode}
                  onSelect={handleSelect}
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
      id={SCROLL_CONTAINER_ID}
      ref={scrollContainerRef}
      sx={{
        flexGrow: 1,
        overflowY: 'auto',
        pr: { xs: 0, sm: 1 },
      }}
    >
      {renderFeed()}
    </Box>
  );
}

export type StoryFeedType = 'top' | 'new';

export interface Story {
  id: number;
  by: string;
  title: string;
  url?: string;
  score: number;
  descendants?: number;
  time: number;
  type: 'story';
  domain?: string;
}

export interface StoriesBatch {
  stories: Story[];
  nextStart: number;
  hasMore: boolean;
}

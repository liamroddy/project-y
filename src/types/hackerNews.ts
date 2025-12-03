export type StoryFeedSort = 'top' | 'new';

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
  kids?: number[];
  text?: string;
}

export interface StoriesBatch {
  stories: Story[];
  nextStart: number;
  hasMore: boolean;
}

export interface Comment {
  id: number;
  by?: string;
  text?: string;
  time: number;
  type: 'comment';
  parent: number;
  kids?: number[];
  deleted?: boolean;
  dead?: boolean;
}

export interface CommentNode extends Comment {
  children?: CommentNode[];
}

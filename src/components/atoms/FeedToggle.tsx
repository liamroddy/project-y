import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { styled } from '@mui/material/styles';
import type { StoryFeedType } from '../../types/hackerNews';

const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
  '& .MuiToggleButtonGroup-grouped': {
    margin: theme.spacing(0.5),
    border: 0,
    '&.Mui-disabled': {
      border: 0,
    },
    '&:not(:first-of-type)': {
      borderRadius: theme.shape.borderRadius,
    },
    '&:first-of-type': {
      borderRadius: theme.shape.borderRadius,
    },
  },
}));

interface FeedToggleProps {
  value: StoryFeedType;
  onChange: (next: StoryFeedType) => void;
}

export function FeedToggle({ value, onChange }: FeedToggleProps) {
  return (
    <StyledToggleButtonGroup
      color="primary"
      exclusive
      size="small"
      value={value}
      onChange={(_, nextValue: StoryFeedType | null) => {
        if (nextValue) {
          onChange(nextValue);
        }
      }}
      aria-label="Filter Hacker News feed"
    >
      <ToggleButton value="top">Top</ToggleButton>
      <ToggleButton value="new">New</ToggleButton>
    </StyledToggleButtonGroup>
  );
}

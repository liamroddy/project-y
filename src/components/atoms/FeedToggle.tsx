import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import { alpha, styled } from '@mui/material/styles';
import type { StoryFeedSort } from '../../types/hackerNews';

const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
  borderRadius: 9999,
  padding: 3,
  margin: 3,
  backgroundColor: alpha(theme.palette.common.white, 0.08),
  display: 'inline-flex',
  alignItems: 'center',
  border: `1px solid ${alpha(theme.palette.common.white, 0.05)}`,
  '& .MuiToggleButtonGroup-grouped': {
    margin: 0,
    border: 0,
    borderRadius: 9999,
    padding: theme.spacing(0.75, 2.25),
    fontWeight: 600,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: alpha(theme.palette.common.white, 0.6),
    transition: theme.transitions.create(['background-color', 'color'], {
      duration: theme.transitions.duration.shortest,
    }),
    '&.Mui-disabled': {
      border: 0,
    },
    '&:hover': {
      backgroundColor: alpha(theme.palette.common.white, 0.06),
    },
    '&.Mui-selected': {
      color: theme.palette.getContrastText(theme.palette.primary.main),
      backgroundColor: theme.palette.primary.main,
      '&:hover': {
        backgroundColor: theme.palette.primary.main,
      },
    },
  },
}));

interface FeedToggleProps {
  value: StoryFeedSort;
  onChange: (next: StoryFeedSort) => void;
}

export function FeedToggle({ value, onChange }: FeedToggleProps) {
  return (
    <StyledToggleButtonGroup
      color="primary"
      exclusive
      size="small"
      value={value}
      onChange={(_, nextValue: StoryFeedSort | null) => {
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

import Chip from '@mui/material/Chip';
import type { ChipProps } from '@mui/material/Chip';

interface StoryChipProps extends Pick<ChipProps, 'icon'> {
  label: string;
}

export function StoryChip({ label, icon }: StoryChipProps) {
  return (
    <Chip
      size="small"
      icon={icon}
      label={label}
      variant="outlined"
      sx={{ fontWeight: 500, backgroundColor: 'background.paper' }}
    />
  );
}

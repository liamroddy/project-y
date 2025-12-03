import Chip from '@mui/material/Chip';
import type { ChipProps } from '@mui/material/Chip';

interface StoryMetaItemProps extends Pick<ChipProps, 'icon'> {
  label: string;
}

export function StoryMetaItem({ label, icon }: StoryMetaItemProps) {
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

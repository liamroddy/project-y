import Typography from '@mui/material/Typography';

import { formatRelativeTime } from '../../utils/time';

interface CommentHeaderProps {
  author: string;
  time: number;
}

export function CommentHeader({ author, time }: CommentHeaderProps) {
  return (
    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
      {author}
      <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
        {formatRelativeTime(time)}
      </Typography>
    </Typography>
  );
}

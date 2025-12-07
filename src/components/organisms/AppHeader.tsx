import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';

function renderYLogo() {
  return (
    <Box
      sx={{
        backgroundColor: (theme) => theme.palette.primary.main,
        color: (theme) => theme.palette.background.header,
        borderRadius: 1.5,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        aspectRatio: '1',
        fontWeight: 800,
        fontSize: { xs: '2.5rem', sm: '3rem' },
        lineHeight: 1,
        px: 1.5,
      }}
      aria-hidden
    >
      Y
    </Box>
  );
}

export function AppHeader() {
  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor: (theme) => theme.palette.background.header,
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Toolbar disableGutters>
        <Stack direction="row" spacing={2} py={1} px={2}>
          {renderYLogo()}
          <div>
            <Typography variant="h4" component="h1">
              Hacker News++
            </Typography>
            <Typography variant="body1" color="text.secondary">
              A modern Hacker News front-end.
            </Typography>
          </div>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}

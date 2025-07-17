import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, Link as RouterLink } from 'react-router-dom';
import OnboardTenant from './pages/OnboardTenant';
import Categories from './pages/Categories';
import Questions from './pages/Questions';
import AnswerQuestionnaire from './pages/AnswerQuestionnaire';
import TeamSelectionPage from './pages/TeamSelectionPage';
import { AppBar, Toolbar, Typography, Button, CssBaseline, Menu, MenuItem, Box, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import Grid from '@mui/material/Grid';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import MuiLink from '@mui/material/Link';

const theme = createTheme({
  palette: {
    primary: {
      main: '#ffffff', // white for AppBar
      light: '#f4f6fa',
      dark: '#e0e7ef',
      contrastText: '#1e293b', // dark text for contrast
    },
    secondary: {
      main: '#6366f1', // vibrant indigo for God Mode button
      contrastText: '#fff',
    },
    background: {
      default: '#f4f6fa',
      paper: 'rgba(255, 255, 255, 0.95)',
    },
  },
  typography: {
    fontFamily: 'Inter, Roboto, "Segoe UI", Arial, sans-serif',
    h4: {
      fontWeight: 700,
      letterSpacing: '-0.02em',
      fontSize: '2rem',
    },
    h6: {
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'rgba(255, 255, 255, 0.85)', // semi-transparent white
          color: '#1e293b', // dark text
          backdropFilter: 'blur(12px)',
          boxShadow: '0 2px 20px rgba(99, 102, 241, 0.08)',
          borderBottom: '1px solid rgba(99, 102, 241, 0.10)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          borderRadius: 16,
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: 'none',
          fontWeight: 600,
          boxShadow: '0 4px 14px rgba(99, 102, 241, 0.08)',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 6px 20px rgba(99, 102, 241, 0.15)',
            transform: 'translateY(-1px)',
          },
        },
        containedSecondary: {
          background: 'linear-gradient(90deg, #6366f1 0%, #8188f0 100%)',
          color: '#fff',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: 'rgba(99, 102, 241, 0.3)',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#6366f1',
            },
          },
        },
      },
    },
  },
});

function GodModeButton({ setGodMode, godMode }: { setGodMode: (v: boolean) => void, godMode: boolean }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();

  const handleGodModeClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (godMode) {
      setAnchorEl(event.currentTarget);
    } else {
      setDialogOpen(true);
      setAnswer('');
      setError('');
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setAnswer('');
    setError('');
  };

  const handleAnswerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAnswer(e.target.value);
    setError('');
  };

  const handleGodModeSubmit = () => {
    if (answer.trim() === 'unipoints2024') {
      setGodMode(true);
      setDialogOpen(false);
    } else {
      setError('Incorrect answer. Try again.');
    }
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMenuSelect = (path: string) => {
    navigate(path);
    setAnchorEl(null);
  };

  return (
    <>
      <Button 
        color="inherit" 
        onClick={handleGodModeClick} 
        aria-controls={godMode ? 'godmode-menu' : undefined} 
        aria-haspopup="true" 
        aria-expanded={godMode && Boolean(anchorEl) ? 'true' : undefined}
        sx={{
          border: '2px solid',
          borderColor: theme.palette.secondary.main,
          color: theme.palette.secondary.main,
          fontWeight: 700,
          borderRadius: 2,
          px: 2,
          background: 'transparent',
          boxShadow: 'none',
          '&:hover': {
            background: 'rgba(99, 102, 241, 0.08)',
            borderColor: theme.palette.secondary.dark,
            color: theme.palette.secondary.dark,
          },
        }}
      >
        God Mode
      </Button>
      <Dialog open={dialogOpen} onClose={handleDialogClose}>
        <DialogTitle>God Mode Access</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>What is the secret code?</Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Secret Code"
            type="password"
            fullWidth
            value={answer}
            onChange={handleAnswerChange}
            error={!!error}
            helperText={error}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button onClick={handleGodModeSubmit} variant="contained">Submit</Button>
        </DialogActions>
      </Dialog>
      <Menu
        id="godmode-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        MenuListProps={{ 'aria-labelledby': 'godmode-button' }}
      >
        <MenuItem onClick={() => handleMenuSelect('/onboard')}>Team Management</MenuItem>
        <MenuItem onClick={() => handleMenuSelect('/categories')}>Category Management</MenuItem>
        <MenuItem onClick={() => handleMenuSelect('/questions')}>Question Management</MenuItem>
      </Menu>
    </>
  );
}

function App() {
  const [godMode, setGodMode] = useState(false);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AppBar position="fixed" color="primary" elevation={0}>
          <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: 64, px: { xs: 1, sm: 2, md: 4 } }}>
            <Box sx={{ flex: 1 }} />
            <MuiLink component={RouterLink} to="/" color="inherit" underline="none" sx={{ fontWeight: 800, fontSize: '1.5rem', letterSpacing: '0.08em', cursor: 'pointer', color: '#1e293b', flex: 1, textAlign: 'center' }}>
              UNIPOINTS
            </MuiLink>
            <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
              <GodModeButton setGodMode={setGodMode} godMode={godMode} />
            </Box>
          </Toolbar>
        </AppBar>
        {/* Spacer to prevent content from being hidden behind the fixed AppBar */}
        <Toolbar sx={{ minHeight: 64, background: 'transparent' }} />
        <Box sx={{ 
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #667ea0, #764ba2)',
          py: { xs: 3, sm: 4, md: 6 },
          px: { xs: 0, sm: 0 }
        }}>
          <Grid container justifyContent="center" alignItems="flex-start" sx={{ minHeight: '100vh', width: '100vw', m: 0, p: 0 }}>
            <Box sx={{ width: '100%', maxWidth: { xs: '100%', sm: '91.6667%', md: '83.3333%', lg: '66.6667%', xl: '58.3333%' }, px: { xs: 2, sm: 3, md: 4 }, py: 0 }}>
              <Routes>
                <Route path="/onboard" element={<OnboardTenant godMode={godMode} />} />
                <Route path="/categories" element={<Categories godMode={godMode} />} />
                <Route path="/questions" element={<Questions godMode={godMode} />} />
                <Route path="/questionnaire/:teamId" element={<AnswerQuestionnaire />} />
                <Route path="/" element={<TeamSelectionPage />} />
                <Route path="*" element={<TeamSelectionPage />} />
              </Routes>
            </Box>
          </Grid>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;

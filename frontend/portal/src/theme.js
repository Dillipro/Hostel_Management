import { createTheme } from '@mui/material/styles'

const base = {
  primary: { main: '#6a4cff', light: '#927cff', dark: '#4126d6' },
  secondary: { main: '#ff6aa2', light: '#ffa0c2', dark: '#d23e76' }
}

export function buildTheme(mode = 'light') {
  const isDark = mode === 'dark'
  return createTheme({
    palette: {
      mode,
      primary: base.primary,
      secondary: base.secondary,
      background: isDark
        ? { default: '#0f0d1a', paper: '#161326' }
        : { default: '#f7f6ff', paper: '#ffffff' },
      divider: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.06)'
    },
    shape: { borderRadius: 12 },
    typography: {
      fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"',
      h5: { fontWeight: 700 },
      h6: { fontWeight: 700 },
      subtitle1: { color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: isDark
            ? { backgroundImage: 'radial-gradient(1200px 600px at 85% -100px, rgba(106,76,255,0.10), rgba(106,76,255,0) 60%), radial-gradient(800px 400px at -10% -20%, rgba(255,106,162,0.08), rgba(255,106,162,0) 55%)' }
            : { backgroundImage: 'radial-gradient(1200px 600px at 85% -100px, rgba(106,76,255,0.12), rgba(106,76,255,0) 60%), radial-gradient(800px 400px at -10% -20%, rgba(255,106,162,0.10), rgba(255,106,162,0) 55%)' }
        }
      },
      MuiAppBar: {
        styleOverrides: {
          colorPrimary: {
            background: isDark ? 'linear-gradient(90deg, #4c3bb3, #6d5bd6)' : 'linear-gradient(90deg, #6a4cff, #8c66ff)'
          }
        }
      },
      MuiPaper: {
        defaultProps: { elevation: 1 },
        styleOverrides: {
          root: {
            borderRadius: 14,
            transition: 'box-shadow 200ms ease',
          }
        }
      },
      MuiButton: {
        defaultProps: { variant: 'contained' },
        styleOverrides: {
          root: { textTransform: 'none', borderRadius: 10, fontWeight: 600 },
          containedSecondary: { color: '#fff' }
        }
      },
      MuiTableHead: {
        styleOverrides: { root: { background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(106,76,255,0.06)' } }
      },
      MuiTableCell: {
        styleOverrides: {
          head: { fontWeight: 700, color: isDark ? 'rgba(255,255,255,0.9)' : undefined, borderBottom: isDark ? '1px solid rgba(255,255,255,0.08)' : undefined },
          root: { borderBottom: isDark ? '1px solid rgba(255,255,255,0.06)' : undefined }
        }
      },
      MuiTableBody: {
        styleOverrides: {
          root: { backgroundColor: 'transparent' }
        }
      },
      MuiTableRow: {
        styleOverrides: {
          root: { '&:hover': { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' } }
        }
      },
      MuiDrawer: {
        styleOverrides: { paper: { borderRight: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.06)' } }
      },
      MuiTextField: { defaultProps: { size: 'small' } },
      MuiSelect: { defaultProps: { size: 'small' } }
    }
  })
}

export default buildTheme

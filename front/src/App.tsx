import { Routes, Route } from "react-router-dom";
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { Home, Detail } from './components';

const lightTheme = createTheme({
  palette: {
    mode: 'light'
  },
})

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

function App() {
  const isDark = useMediaQuery('(prefers-color-scheme: dark)');
  return (
    <ThemeProvider theme={isDark ? darkTheme : lightTheme}>
      <CssBaseline />
      <Routes>
        <Route index element={<Home />} />
        <Route path="/detail/:id" element={<Detail />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App;

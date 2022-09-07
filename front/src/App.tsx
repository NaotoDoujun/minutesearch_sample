import * as React from 'react';
import { Routes, Route } from "react-router-dom";
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { AppSettingsContext, Home, Results, Detail } from './components';

const lightTheme = createTheme({
  palette: {
    mode: 'light'
  },
});

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

function App() {
  const isDark = useMediaQuery('(prefers-color-scheme: dark)');
  const [isOpenDrawer, setIsOpenDrawer] = React.useState<boolean>(false);
  const [searchTerm, setSearchTerm] = React.useState<string>('');
  const [resultsPerPage, setResultsPerPage] = React.useState<number>(10);
  const [recommendsSize, setRecommendsSize] = React.useState<number>(3);
  return (
    <ThemeProvider theme={isDark ? darkTheme : lightTheme}>
      <CssBaseline />
      <AppSettingsContext.Provider value={{
        isOpenDrawer,
        setIsOpenDrawer,
        searchTerm,
        setSearchTerm,
        resultsPerPage,
        setResultsPerPage,
        recommendsSize,
        setRecommendsSize
      }}>
        <Routes>
          <Route path="/" element={<Home />}>
            <Route index element={<Results />} />
            <Route path="/detail/:id" element={<Detail />} />
          </Route>
        </Routes>
      </AppSettingsContext.Provider>
    </ThemeProvider>
  );
}

export default App;

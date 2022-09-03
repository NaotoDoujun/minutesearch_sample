import * as React from 'react';
import { AppBar, Box, Toolbar, Typography, Drawer, IconButton, TextField } from '@mui/material';
import { Search as SearchIcon, Settings as SettingsIcon } from '@mui/icons-material';
import { styled, alpha } from '@mui/material/styles';
import { AppSettingsContext } from '.';
import { Settings } from '../Settings';

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  color: 'inherit',
  '& .MuiOutlinedInput-root.MuiInputBase-sizeSmall': {
    padding: 0,
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(3)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '30ch',
    },
  },
}));

function SearchAppBar() {
  const { isOpenDrawer, setIsOpenDrawer } = React.useContext(AppSettingsContext);
  const toggleDrawer = (open: boolean) =>
    (event: React.KeyboardEvent | React.MouseEvent) => {
      if (
        event.type === 'keydown' &&
        ((event as React.KeyboardEvent).key === 'Tab' ||
          (event as React.KeyboardEvent).key === 'Shift')
      ) {
        return;
      }
      setIsOpenDrawer(open);
    };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ display: { xs: 'none', sm: 'block' } }}
          >
            App Title
          </Typography>
          <Search>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledTextField size="small" placeholder="Search…" />
          </Search>
          <Box sx={{ flexGrow: 1 }} />
          <IconButton onClick={toggleDrawer(true)}><SettingsIcon /></IconButton>
        </Toolbar>
      </AppBar>
      <Drawer anchor='right' open={isOpenDrawer} onClose={toggleDrawer(false)}>
        <Box sx={{ 'width': 250 }}>
          <Settings />
        </Box>
      </Drawer>
    </Box>
  );
}

export { SearchAppBar }
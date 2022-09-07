import { Box, Grid } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { SearchAppBar } from '../Common';

function Home() {
  return (
    <>
      <SearchAppBar />
      <Box sx={{ flexGrow: 1 }}>
        <Grid container spacing={2}>
          <Grid item>
            <Outlet />
          </Grid>
        </Grid>
      </Box>
    </>
  );
};
export { Home };
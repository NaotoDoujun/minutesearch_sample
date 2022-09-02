import { Box, Grid } from '@mui/material';
import { SearchAppBar } from '../Common';
import { Results } from './Results';

function Home() {
  return (
    <>
      <SearchAppBar />
      <Box sx={{ flexGrow: 1 }}>
        <Grid container spacing={2}>
          <Grid item>
            <Results />
          </Grid>
        </Grid>
      </Box>
    </>
  )
}
export { Home }
import * as React from 'react';
import {
  Card,
  CardHeader,
  IconButton,
  CardContent,
  Divider,
  FormControl,
  InputLabel,
  MenuItem
} from '@mui/material';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { AppSettingsContext } from '../Common';
import { Close as CloseIcon } from '@mui/icons-material';

function Settings() {
  const {
    setIsOpenDrawer,
    resultsPerPage,
    setResultsPerPage,
    recommendsSize,
    setRecommendsSize } = React.useContext(AppSettingsContext);
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

  const handleResultsPerPageChange = (event: SelectChangeEvent) => {
    const resultsPerPage = parseInt(event.target.value);
    setResultsPerPage(resultsPerPage);
  };

  const handleRecommendsSizeChange = (event: SelectChangeEvent) => {
    const recommendsSize = parseInt(event.target.value);
    setRecommendsSize(recommendsSize);
  };

  return (
    <Card sx={{ height: "100vh" }}>
      <CardHeader title="Settings" action={
        <IconButton aria-label="settings" onClick={toggleDrawer(false)}>
          <CloseIcon />
        </IconButton>
      } />
      <Divider />
      <CardContent>
        <FormControl sx={{ m: 1, minWidth: 150 }}>
          <InputLabel id="resultsperpage-select-label">Results Per Page</InputLabel>
          <Select
            labelId="resultsperpage-select-label"
            id="resultsperpage-select"
            value={resultsPerPage.toString()}
            label="Results Per Page"
            onChange={handleResultsPerPageChange}
          >
            <MenuItem value="10">10</MenuItem>
            <MenuItem value="20">20</MenuItem>
            <MenuItem value="50">50</MenuItem>
          </Select>
        </FormControl>
        <FormControl sx={{ m: 1, minWidth: 150 }}>
          <InputLabel id="recommendssize-select-label">Recommends Size</InputLabel>
          <Select
            labelId="recommendssize-select-label"
            id="recommendssize-select"
            value={recommendsSize.toString()}
            label="Recommends Size"
            onChange={handleRecommendsSizeChange}
          >
            <MenuItem value="3">3</MenuItem>
            <MenuItem value="5">5</MenuItem>
            <MenuItem value="10">10</MenuItem>
          </Select>
        </FormControl>
      </CardContent>
    </Card>
  )
}

export { Settings }
import * as React from 'react';
import {
  Card,
  CardHeader,
  IconButton,
  CardContent,
  Divider,
  FormControl
} from '@mui/material';
import { AppSettingsContext } from '../Common';
import { Close as CloseIcon } from '@mui/icons-material';

function Settings() {
  const { setIsOpenDrawer } = React.useContext(AppSettingsContext);

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
    <Card sx={{ height: "100vh" }}>
      <CardHeader title="Settings" action={
        <IconButton aria-label="settings" onClick={toggleDrawer(false)}>
          <CloseIcon />
        </IconButton>
      } />
      <Divider />
      <CardContent>
        <FormControl sx={{ minWidth: 120 }}>
        </FormControl>
      </CardContent>
    </Card>
  )
}

export { Settings }
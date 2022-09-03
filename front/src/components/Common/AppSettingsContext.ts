import * as React from 'react';

export type AppSettingsContextType = {
  isOpenDrawer: boolean
  setIsOpenDrawer: React.Dispatch<React.SetStateAction<boolean>>
};

export const AppSettingsContext = React.createContext<AppSettingsContextType>({
  isOpenDrawer: false,
  setIsOpenDrawer: () => undefined
});
import * as React from 'react';

export type AppSettingsContextType = {
  isOpenDrawer: boolean
  setIsOpenDrawer: React.Dispatch<React.SetStateAction<boolean>>
  searchTerm: string
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>
  resultsPerPage: number
  setResultsPerPage: React.Dispatch<React.SetStateAction<number>>
  recommendsSize: number
  setRecommendsSize: React.Dispatch<React.SetStateAction<number>>
};

export const AppSettingsContext = React.createContext<AppSettingsContextType>({
  isOpenDrawer: false,
  setIsOpenDrawer: () => undefined,
  searchTerm: '',
  setSearchTerm: () => undefined,
  resultsPerPage: 10,
  setResultsPerPage: () => undefined,
  recommendsSize: 3,
  setRecommendsSize: () => undefined
});
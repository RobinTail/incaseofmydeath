import React from "react";

export const ColorModeContext = React.createContext({ toggle: () => {} });

export interface SnackbarContent {
  message: string;
  success: boolean;
}

export const SnackbarContext = React.createContext<{
  showSnackbar: (content: SnackbarContent) => void;
}>({
  showSnackbar: () => {},
});

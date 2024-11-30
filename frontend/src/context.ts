import React from "react";

export interface SnackbarContent {
  message: string;
  success: boolean;
}

export const SnackbarContext = React.createContext<{
  showSnackbar: (content: SnackbarContent) => void;
}>({
  showSnackbar: () => {},
});

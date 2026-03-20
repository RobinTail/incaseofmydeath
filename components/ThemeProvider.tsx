"use client";

import {
  createTheme,
  CssBaseline,
  ThemeProvider as MuiThemeProvider,
} from "@mui/material";
import { ReactNode, useMemo } from "react";

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const theme = useMemo(() => {
    return createTheme({
      colorSchemes: {
        dark: true,
        light: true,
      },
      defaultColorScheme: "dark",
      components: {
        MuiIcon: {
          defaultProps: {
            className: "material-symbols-outlined",
          },
        },
      },
    });
  }, []);

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
}

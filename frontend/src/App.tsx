import {
  createTheme,
  CssBaseline,
  Skeleton,
  ThemeProvider,
} from "@mui/material";
import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { paths } from "./paths.ts";
import { Wrapper } from "./Wrapper.tsx";

const Intro = React.lazy(() => import("./Intro.tsx"));
const PersonalArea = React.lazy(() => import("./PersonalArea.tsx"));
const PublicStatus = React.lazy(() => import("./PublicStatus.tsx"));

export const App = () => {
  const theme = React.useMemo(
    () =>
      createTheme({
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
      }),
    [],
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Wrapper>
          <React.Suspense
            fallback={
              <Skeleton
                variant="rounded"
                animation="wave"
                width="100%"
                height="60vh"
              />
            }
          >
            <Routes>
              <Route path={paths.root} element={<Intro />} />
              <Route path={paths.personalArea} element={<PersonalArea />} />
              <Route path={paths.publicStatus} element={<PublicStatus />} />
            </Routes>
          </React.Suspense>
        </Wrapper>
      </BrowserRouter>
    </ThemeProvider>
  );
};

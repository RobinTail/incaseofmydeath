import {
  createTheme,
  PaletteMode,
  Skeleton,
  ThemeProvider,
} from "@mui/material";
import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import useLocalStorageState from "use-local-storage-state";
import { ColorModeContext } from "./context.ts";
import { paths } from "./paths.ts";
import { Wrapper } from "./Wrapper.tsx";

const Intro = React.lazy(() => import("./Intro.tsx"));
const PersonalArea = React.lazy(() => import("./PersonalArea.tsx"));
const PublicStatus = React.lazy(() => import("./PublicStatus.tsx"));

const ensureColorMode = (value: unknown): PaletteMode => {
  const valueStr = `${value}`;
  const modes: PaletteMode[] = ["light", "dark"];
  return (modes as string[]).includes(valueStr)
    ? (valueStr as PaletteMode)
    : "dark";
};

export const App = () => {
  const [_colorMode, setColorMode] = useLocalStorageState<unknown>(
    "colorMode",
    { defaultValue: "dark" },
  );
  const colorMode = React.useMemo(
    () => ensureColorMode(_colorMode),
    [_colorMode],
  );

  const colorContext = React.useMemo<
    React.ContextType<typeof ColorModeContext>
  >(
    () => ({
      toggle: () => {
        setColorMode((prevMode: PaletteMode) =>
          prevMode === "light" ? "dark" : "light",
        );
      },
    }),
    [],
  );

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: colorMode,
        },
      }),
    [colorMode],
  );

  return (
    <ColorModeContext.Provider value={colorContext}>
      <ThemeProvider theme={theme}>
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
    </ColorModeContext.Provider>
  );
};

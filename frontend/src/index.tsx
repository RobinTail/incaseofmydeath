import { createTheme, PaletteMode, ThemeProvider } from "@mui/material";
import React from "react";
import ReactDOM from "react-dom";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import useLocalStorageState from "use-local-storage-state";
import { Intro } from "./Intro";
import { paths } from "./paths";
import { PersonalArea } from "./PersonalArea";
import { ColorModeContext } from "./context";
import { PublicStatus } from "./PublicStatus";
import reportWebVitals from "./reportWebVitals";
import { Wrapper } from "./Wrapper";

const ensureColorMode = (value: unknown): PaletteMode => {
  const valueStr = `${value}`;
  const modes: PaletteMode[] = ["light", "dark"];
  return (modes as string[]).includes(valueStr)
    ? (valueStr as PaletteMode)
    : "dark";
};

const App = () => {
  const [_colorMode, setColorMode] = useLocalStorageState<unknown>(
    "colorMode",
    { defaultValue: "dark" }
  );
  const colorMode = React.useMemo(
    () => ensureColorMode(_colorMode),
    [_colorMode]
  );

  const colorContext = React.useMemo<
    React.ContextType<typeof ColorModeContext>
  >(
    () => ({
      toggle: () => {
        setColorMode((prevMode: PaletteMode) =>
          prevMode === "light" ? "dark" : "light"
        );
      },
    }),
    [] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: colorMode,
        },
      }),
    [colorMode]
  );

  return (
    <ColorModeContext.Provider value={colorContext}>
      <ThemeProvider theme={theme}>
        <BrowserRouter>
          <Wrapper>
            <Routes>
              <Route path={paths.root} element={<Intro />} />
              <Route path={paths.personalArea} element={<PersonalArea />} />
              <Route path={paths.publicStatus} element={<PublicStatus />} />
            </Routes>
          </Wrapper>
        </BrowserRouter>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

import {
  Alert,
  Box,
  Container,
  Icon,
  IconButton,
  Snackbar,
  Tooltip,
  useColorScheme,
  useTheme,
} from "@mui/material";
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { SnackbarContent, SnackbarContext } from "./context";
import { paths } from "./paths";

export const Wrapper = ({ children }: { children: React.ReactNode }) => {
  const theme = useTheme();
  const { mode, setMode } = useColorScheme();
  const [isSnackbarOpened, setSnackbarOpened] = React.useState(false);
  const [snackbarContent, setSnackbarContent] = React.useState<SnackbarContent>(
    {
      message: "",
      success: true,
    },
  );

  const navigate = useNavigate();
  const location = useLocation();
  const isRoot = location.pathname === paths.root;
  const closeSnackbar = () => setSnackbarOpened(false);
  const showSnackbar = (content: SnackbarContent) => {
    setSnackbarContent(content);
    setSnackbarOpened(true);
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          mt: 8,
          mb: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {!isRoot && (
          <Tooltip title="Home" placement="right" arrow={true}>
            <IconButton
              sx={{
                position: "absolute",
                top: theme.spacing(2),
                left: theme.spacing(2),
              }}
              onClick={() => navigate(paths.root)}
            >
              <Icon>home</Icon>
            </IconButton>
          </Tooltip>
        )}

        <Tooltip
          title={theme.palette.mode === "dark" ? "Light mode" : "Dark mode"}
          placement="left"
          arrow={true}
        >
          <IconButton
            sx={{
              position: "absolute",
              top: theme.spacing(2),
              right: theme.spacing(2),
            }}
            onClick={() => setMode(mode === "light" ? "dark" : "light")}
            color="inherit"
          >
            <Icon>
              {theme.palette.mode === "dark" ? "brightness_7" : "brightness_4"}
            </Icon>
          </IconButton>
        </Tooltip>
        <SnackbarContext.Provider value={{ showSnackbar }}>
          {children}
        </SnackbarContext.Provider>
        <Snackbar
          open={isSnackbarOpened}
          autoHideDuration={4000}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          onClose={closeSnackbar}
        >
          <Alert
            onClose={closeSnackbar}
            severity={snackbarContent.success ? "success" : "error"}
            variant="filled"
            sx={{ width: "100%" }}
          >
            {snackbarContent.message}
          </Alert>
        </Snackbar>
      </Box>
    </Container>
  );
};

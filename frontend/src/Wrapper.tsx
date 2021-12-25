import {
  Box,
  Container,
  CssBaseline,
  IconButton,
  Tooltip,
  useTheme,
} from "@mui/material";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import HomeIcon from "@mui/icons-material/Home";
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ColorModeContext } from "./context";
import { paths } from "./paths";

export const Wrapper = ({ children }: { children: React.ReactNode }) => {
  const theme = useTheme();
  const colorContext = React.useContext(ColorModeContext);
  const navigate = useNavigate();
  const location = useLocation();
  const isRoot = location.pathname === paths.root;

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
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
              <HomeIcon />
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
            onClick={() => {
              colorContext.toggle();
            }}
            color="inherit"
          >
            {theme.palette.mode === "dark" ? (
              <Brightness7Icon />
            ) : (
              <Brightness4Icon />
            )}
          </IconButton>
        </Tooltip>
        {children}
      </Box>
    </Container>
  );
};

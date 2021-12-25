import { InfoOutlined } from "@mui/icons-material";
import GitHubIcon from "@mui/icons-material/GitHub";
import BuildCircleIcon from "@mui/icons-material/BuildCircle";
import {
  Avatar,
  Badge,
  IconButton,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import React from "react";

interface PersonProps {
  isAuthorized: boolean;
  isRegistered: boolean;
  avatarUrl?: string;
  login?: string;
  name?: string | null;
  isPersistent: boolean;
  onSettingsClick: () => void;
}

export const Person = ({
  isAuthorized,
  isRegistered,
  avatarUrl,
  login,
  name,
  isPersistent,
  onSettingsClick,
}: PersonProps) => {
  const theme = useTheme();

  return (
    <>
      {isAuthorized ? (
        <Badge
          badgeContent={
            isAuthorized &&
            isRegistered && (
              <IconButton onClick={onSettingsClick}>
                <BuildCircleIcon />
              </IconButton>
            )
          }
        >
          <Avatar src={avatarUrl} sx={{ width: 100, height: 100, m: 1 }}>
            {login}
          </Avatar>
        </Badge>
      ) : (
        <GitHubIcon
          sx={{ m: 1, color: theme.palette.text.primary, fontSize: 100 }}
        />
      )}
      <Typography component="h1" variant="h5">
        {isAuthorized ? name || login : "Authorize on GitHub"}
        {isAuthorized && !isPersistent && (
          <Tooltip title="Please enable Local Storage in your browser settings to preserve your authentication">
            <InfoOutlined color="error" />
          </Tooltip>
        )}
      </Typography>
    </>
  );
};

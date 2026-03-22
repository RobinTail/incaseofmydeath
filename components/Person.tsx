"use client";

import {
  Avatar,
  Badge,
  Box,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import Icon from "@mui/material/Icon";

interface PersonProps {
  isAuthorized: boolean;
  isRegistered: boolean;
  avatarUrl?: string;
  login?: string;
  name?: string | null;
  onSettingsClick?: () => void;
}

export function Person({
  isAuthorized,
  isRegistered,
  avatarUrl,
  login,
  name,
  onSettingsClick,
}: PersonProps) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {isAuthorized ? (
        <Badge
          badgeContent={
            isAuthorized &&
            isRegistered &&
            onSettingsClick && (
              <Tooltip title="Settings" placement="right" arrow>
                <IconButton onClick={onSettingsClick} size="small">
                  <Icon sx={{ fontSize: 20 }}>build_circle</Icon>
                </IconButton>
              </Tooltip>
            )
          }
        >
          <Avatar src={avatarUrl} alt={login} sx={{ width: 100, height: 100 }}>
            {login}
          </Avatar>
        </Badge>
      ) : (
        <Icon sx={{ fontSize: 100, color: "text.primary" }}>
          conversion_path
        </Icon>
      )}
      <Typography component="h1" variant="h5" sx={{ mt: 1 }}>
        {isAuthorized ? name || login : "Authorize on GitHub"}
      </Typography>
    </Box>
  );
}

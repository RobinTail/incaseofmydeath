import {
  Avatar,
  Box,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
} from "@mui/material";
import TelegramIcon from "@mui/icons-material/Telegram";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import React from "react";
import { TLoginButton, TLoginButtonSize } from "react-telegram-auth";
import { connectTelegram, disconnectTelegram } from "./api";

interface ChannelsProps {
  userId: number;
  uToken: string;
  onChange: () => Promise<void>;
  channels: {
    telegram: {
      connected: boolean;
    };
  };
}

export const Channels = ({
  userId,
  channels,
  onChange,
  uToken,
}: ChannelsProps) => {
  const tgLoginButton = (
    <TLoginButton
      botName="inCaseOfMyDeathBot"
      buttonSize={TLoginButtonSize.Small}
      lang="en"
      usePic={false}
      cornerRadius={4}
      requestAccess="write"
      onAuthCallback={async (user) => {
        const { hash, ...rest } = user;
        const dataCheckString = (Object.keys(rest) as (keyof typeof rest)[])
          .sort()
          .map((key) => `${key}=${rest[key]}`)
          .join("\n");
        await connectTelegram({
          chatId: `${user.id}`,
          hash,
          dataCheckString,
          userId,
          uToken,
        });
        await onChange();
      }}
    />
  );

  return (
    <Box sx={{ mt: 2, mb: 4 }} textAlign="center">
      <Typography component="h2" variant="h5">
        Communication Channels
      </Typography>
      <List>
        <ListItem
          sx={{ minWidth: channels.telegram.connected ? undefined : "320px" }}
          secondaryAction={
            channels.telegram.connected ? (
              <IconButton
                color="error"
                onClick={async () => {
                  await disconnectTelegram({ userId, uToken });
                  await onChange();
                }}
              >
                <RemoveCircleOutlineIcon />
              </IconButton>
            ) : (
              tgLoginButton
            )
          }
        >
          <ListItemAvatar>
            <Avatar>
              <TelegramIcon />
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary="Telegram"
            secondary={
              channels.telegram.connected ? "Connected" : "Not connected"
            }
          />
        </ListItem>
      </List>
    </Box>
  );
};

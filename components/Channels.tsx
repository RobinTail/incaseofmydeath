'use client'

import {
  Avatar,
  Box,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
} from '@mui/material'
import Icon from '@mui/material/Icon'
import { TLoginButton, TLoginButtonSize, TUser } from 'react-telegram-auth'

interface ChannelsProps {
  telegramConnected: boolean
  onConnectTelegram: (user: { id: number; hash: string; dataCheckString: string }) => void
  onDisconnectTelegram: () => void
}

export function Channels({
  telegramConnected,
  onConnectTelegram,
  onDisconnectTelegram,
}: ChannelsProps) {
  const handleTelegramAuth = async (user: TUser) => {
    const { hash, ...rest } = user
    const dataCheckString = Object.keys(rest)
      .sort()
      .map((key) => `${key}=${rest[key as keyof typeof rest]}`)
      .join('\n')
    onConnectTelegram({
      id: user.id,
      hash: hash,
      dataCheckString,
    })
  }

  return (
    <Box textAlign="center">
      <Typography component="h2" variant="h5">
        Communication Channels
      </Typography>
      <List>
        <ListItem sx={{ minWidth: telegramConnected ? undefined : '320px' }}>
          <ListItemAvatar>
            <Avatar>
              <Icon sx={{ transform: 'rotate(-30deg)', transformOrigin: '40% 40%' }}>send</Icon>
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary="Telegram"
            secondary={telegramConnected ? 'Connected' : 'Not connected'}
          />
          {telegramConnected ? (
            <IconButton color="error" onClick={onDisconnectTelegram}>
              <Icon>delete</Icon>
            </IconButton>
          ) : (
            <TLoginButton
              botName="inCaseOfMyDeathBot"
              buttonSize={TLoginButtonSize.Small}
              lang="en"
              usePic={false}
              cornerRadius={4}
              requestAccess="write"
              onAuthCallback={handleTelegramAuth}
            />
          )}
        </ListItem>
      </List>
    </Box>
  )
}

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

interface ChannelsProps {
  telegramConnected: boolean
  onConnectTelegram: () => void
  onDisconnectTelegram: () => void
}

export function Channels({
  telegramConnected,
  onConnectTelegram,
  onDisconnectTelegram,
}: ChannelsProps) {
  return (
    <Box sx={{ mt: 2, mb: 4 }} textAlign="center">
      <Typography component="h2" variant="h5">
        Communication Channels
      </Typography>
      <List>
        <ListItem
          sx={{ minWidth: telegramConnected ? undefined : '320px' }}
          secondaryAction={
            telegramConnected ? (
              <IconButton color="error" onClick={onDisconnectTelegram}>
                <Icon>remove</Icon>
              </IconButton>
            ) : (
              <IconButton color="success" onClick={onConnectTelegram}>
                <Icon>add</Icon>
              </IconButton>
            )
          }
        >
          <ListItemAvatar>
            <Avatar>
              <Icon sx={{ transform: 'rotate(-30deg)', transformOrigin: '40% 40%' }}>send</Icon>
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary="Telegram"
            secondary={telegramConnected ? 'Connected' : 'Not connected'}
          />
        </ListItem>
      </List>
    </Box>
  )
}

import {
  Avatar,
  Badge,
  CircularProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import React from "react";

interface IconicListProps {
  isLoading: boolean;
  icon: React.ReactNode;
  items: {
    key: string | number;
    primary: React.ReactNode;
    secondary?: React.ReactNode;
    badge?: {
      color: "success" | "warning";
      content: React.ReactNode;
    };
    onClick: () => void;
  }[];
}

export const IconicListSelector = ({
  isLoading,
  icon,
  items,
}: IconicListProps) => {
  return (
    <List>
      {isLoading ? (
        <ListItem sx={{ justifyContent: "center" }}>
          <CircularProgress />
        </ListItem>
      ) : (
        items.map(({ key, onClick, badge, primary, secondary }) => (
          <ListItemButton key={key} onClick={onClick}>
            <ListItemAvatar>
              {badge ? (
                <Badge
                  color={badge.color}
                  badgeContent={badge.content}
                  anchorOrigin={{ vertical: "top", horizontal: "left" }}
                >
                  <Avatar>{icon}</Avatar>
                </Badge>
              ) : (
                <Avatar>{icon}</Avatar>
              )}
            </ListItemAvatar>
            <ListItemText primary={primary} secondary={secondary} />
          </ListItemButton>
        ))
      )}
    </List>
  );
};

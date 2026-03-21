"use client";

import { Chip, CircularProgress } from "@mui/material";
import Icon from "@mui/material/Icon";

interface UserStatusProps {
  isAlive: boolean | null;
  loading?: boolean;
}

export function UserStatus({ isAlive, loading }: UserStatusProps) {
  if (loading) {
    return <CircularProgress size={24} />;
  }

  if (isAlive === null) {
    return null;
  }

  return (
    <Chip
      icon={<Icon className='material-symbols-outlined'>
        {isAlive ? "favorite" : "heart_broken"}
      </Icon>}
      label={isAlive ? "Alive" : "Dead"}
      color={isAlive ? "success" : "error"}
      variant="outlined"
    />
  );
}

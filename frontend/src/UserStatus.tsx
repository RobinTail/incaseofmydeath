import { Chip, Typography } from "@mui/material";
import React from "react";

interface UserStatusProps {
  isAuthorized: boolean;
  isRegistered: boolean | null;
  isRepoSelected: boolean;
  isWorkflowSelected: boolean;
  isLoading: boolean;
  isAlive: boolean | null;
}

export const UserStatus = ({
  isAuthorized,
  isRegistered,
  isRepoSelected,
  isWorkflowSelected,
  isLoading,
  isAlive,
}: UserStatusProps) => {
  let status: React.ReactNode = isLoading
    ? "Loading..."
    : "Authorize the App to access a private repository.";

  if (isAuthorized) {
    if (isRegistered) {
      status = (
        <Chip
          color={isAlive ? "success" : "warning"}
          label={`Status: ${isAlive ? "Alive" : "Dead"}`}
          variant="outlined"
        />
      );
    } else if (isRegistered === false) {
      if (isRepoSelected) {
        if (isWorkflowSelected) {
          status = "Give your consent.";
        } else {
          status = "Choose the workflow.";
        }
      } else {
        status = "Choose the repository.";
      }
    }
  }

  return <Typography gutterBottom>{status}</Typography>;
};

"use client";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";

interface SettingsDialogProps {
  open: boolean;
  onClose: () => void;
  onUnregister: () => void;
  isLoading: boolean;
  repo: { owner: string; name: string } | null;
  workflow: { name: string } | null;
}

export function SettingsDialog({
  open,
  onClose,
  onUnregister,
  isLoading,
  repo,
  workflow,
}: SettingsDialogProps) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Settings</DialogTitle>
      <DialogContent>
        {repo && workflow ? (
          <>
            <Typography gutterBottom>Your last will is set.</Typography>
            <Typography>Repo: {repo.name}</Typography>
            <Typography>Owner: {repo.owner}</Typography>
            <Typography>Workflow: {workflow.name}</Typography>
          </>
        ) : (
          <Typography>No workflow registered yet.</Typography>
        )}
      </DialogContent>
      <DialogActions>
        {repo && (
          <Button
            variant="outlined"
            color="error"
            onClick={onUnregister}
            disabled={isLoading}
          >
            Unregister workflow
          </Button>
        )}
        <Button variant="contained" onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

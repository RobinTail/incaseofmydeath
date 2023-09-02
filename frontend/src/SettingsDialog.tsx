import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { removeRegistration } from "./api";
import { paths } from "./paths";

interface SettingsDrawerProps {
  open: boolean;
  onClose: () => void;
  onRemoveRegistration: () => void;
  userId: number | null;
  uToken: string | null;
  repo: {
    owner: string;
    name: string;
  } | null;
  workflow: {
    name: string;
  } | null;
}

export const SettingsDialog = ({
  open,
  onClose,
  onRemoveRegistration,
  userId,
  uToken,
  repo,
  workflow,
}: SettingsDrawerProps) => {
  const navigate = useNavigate();

  return (
    <Dialog onClose={onClose} open={open}>
      <DialogTitle>Settings</DialogTitle>
      <DialogContent>
        {repo && workflow && (
          <>
            <Typography gutterBottom>Your last will is set.</Typography>
            <Typography>Repo: {repo.name}</Typography>
            <Typography>Owner: {repo.owner}</Typography>
            <Typography>Workflow: {workflow.name}</Typography>
          </>
        )}
      </DialogContent>
      <DialogActions>
        {userId && uToken && (
          <Button
            variant="outlined"
            color="error"
            onClick={async () => {
              await removeRegistration({ userId, uToken });
              onRemoveRegistration();
              navigate(paths.root);
            }}
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
};

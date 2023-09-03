import GitHubIcon from "@mui/icons-material/GitHub";
import { Alert, Avatar, Chip, Typography, useTheme } from "@mui/material";
import React from "react";
import { useParams } from "react-router-dom";
import { getPublicStatus } from "./api";

type Status = Awaited<ReturnType<typeof getPublicStatus>> | null;

const PublicStatus = () => {
  const { login } = useParams();
  const theme = useTheme();
  const [isLoading, setIsLoading] = React.useState(false);
  const [status, setStatus] = React.useState<Status>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (login) {
      setIsLoading(true);
      (async () => {
        try {
          setStatus(await getPublicStatus(login));
        } catch (e) {
          if (e instanceof Error) {
            setError(e.message);
          }
        }
        setIsLoading(false);
      })();
    }
  }, [login]);

  if (!login) {
    return <Alert severity="error">GitHub login is not supplied</Alert>;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!status || isLoading) {
    return <Alert severity="info">Loading...</Alert>;
  }

  const lastConfirmation = new Date(status.lastConfirmation);

  return (
    <>
      {status.avatarUrl ? (
        <Avatar src={status.avatarUrl} sx={{ width: 100, height: 100, m: 1 }}>
          {status.name || status.login}
        </Avatar>
      ) : (
        <GitHubIcon
          sx={{ m: 1, color: theme.palette.text.primary, fontSize: 100 }}
        />
      )}
      <Typography component="h1" variant="h5" gutterBottom>
        {status.name || status.login}
      </Typography>
      <Chip
        color={status.isAlive ? "success" : "warning"}
        label={`Status: ${status.isAlive ? "Alive" : "Dead"}`}
        variant="outlined"
      />
      <Typography variant="subtitle2" mt={2}>
        Last confirmation: {lastConfirmation.toLocaleDateString()}
      </Typography>
    </>
  );
};

export default PublicStatus;

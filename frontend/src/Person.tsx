import {
  Avatar,
  Badge,
  IconButton,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import Icon from "@mui/material/Icon";

interface PersonProps {
  isAuthorized: boolean;
  isRegistered: boolean;
  avatarUrl?: string;
  login?: string;
  name?: string | null;
  isPersistent: boolean;
  onSettingsClick: () => void;
}

export const Person = ({
  isAuthorized,
  isRegistered,
  avatarUrl,
  login,
  name,
  isPersistent,
  onSettingsClick,
}: PersonProps) => {
  const theme = useTheme();

  return (
    <>
      {isAuthorized ? (
        <Badge
          badgeContent={
            isAuthorized &&
            isRegistered && (
              <Tooltip title="Settings" placement="right" arrow>
                <IconButton onClick={onSettingsClick}>
                  <Icon>build_circle</Icon>
                </IconButton>
              </Tooltip>
            )
          }
        >
          <Avatar src={avatarUrl} sx={{ width: 100, height: 100, m: 1 }}>
            {login}
          </Avatar>
        </Badge>
      ) : (
        <Icon sx={{ m: 1, color: theme.palette.text.primary, fontSize: 100 }}>
          conversion_path
        </Icon>
      )}
      <Typography component="h1" variant="h5">
        {isAuthorized ? name || login : "Authorize on GitHub"}
        {isAuthorized && !isPersistent && (
          <Tooltip title="Please enable Local Storage in your browser settings to preserve your authentication">
            <Icon color="error">info</Icon>
          </Tooltip>
        )}
      </Typography>
    </>
  );
};

import ChatIcon from "@mui/icons-material/Chat";
import CommentIcon from "@mui/icons-material/Comment";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import GitHubIcon from "@mui/icons-material/GitHub";
import PlayCircleOutlineOutlinedIcon from "@mui/icons-material/PlayCircleOutlineOutlined";
import RingVolumeIcon from "@mui/icons-material/RingVolume";
import SignalWifiLost from "@mui/icons-material/SignalWifiStatusbarConnectedNoInternet4";
import Timeline from "@mui/lab/Timeline";
import TimelineItem from "@mui/lab/TimelineItem";
import Typography from "@mui/material/Typography";
import {useTheme} from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import TimelineSeparator from "@mui/lab/TimelineSeparator";
import TimelineDot from "@mui/lab/TimelineDot";
import TimelineConnector from "@mui/lab/TimelineConnector";
import TimelineContent from "@mui/lab/TimelineContent";

export const HowItWorksTimeline = () => {
  const theme = useTheme();
  const isXS = useMediaQuery(theme.breakpoints.only("xs"));
  const listItemSx = {
    "&:before": { display: "none" },
    minWidth: isXS ? undefined : "375px",
  };

  return (
    <Timeline position="right" sx={{ my: 0, py: 0 }}>
      <TimelineItem sx={listItemSx}>
        <TimelineSeparator>
          <TimelineDot>
            <GitHubIcon htmlColor={theme.palette.background.default} />
          </TimelineDot>
          <TimelineConnector />
        </TimelineSeparator>
        <TimelineContent>
          <Typography>You create a workflow on GitHub</Typography>
          <Typography variant="body2" color="text.secondary">
            In a private repo for manual dispatch event.
          </Typography>
        </TimelineContent>
      </TimelineItem>

      <TimelineItem sx={listItemSx}>
        <TimelineSeparator>
          <TimelineDot>
            <FactCheckIcon htmlColor={theme.palette.background.default} />
          </TimelineDot>
          <TimelineConnector />
        </TimelineSeparator>
        <TimelineContent>
          <Typography>You grant access to the Application</Typography>
          <Typography variant="body2" color="text.secondary">
            Only the workflow run permissions needed.
          </Typography>
        </TimelineContent>
      </TimelineItem>

      <TimelineItem sx={listItemSx}>
        <TimelineSeparator>
          <TimelineDot>
            <RingVolumeIcon htmlColor={theme.palette.background.default} />
          </TimelineDot>
          <TimelineConnector />
        </TimelineSeparator>
        <TimelineContent>
          <Typography>You activate communication channels</Typography>
          <Typography variant="body2" color="text.secondary">
            For example, authorize the Telegram bot.
          </Typography>
        </TimelineContent>
      </TimelineItem>

      <TimelineItem sx={listItemSx}>
        <TimelineSeparator>
          <TimelineDot>
            <ChatIcon htmlColor={theme.palette.background.default} />
          </TimelineDot>
          <TimelineConnector />
        </TimelineSeparator>
        <TimelineContent>
          <Typography>The App regularly communicates with you</Typography>
          <Typography variant="body2" color="text.secondary">
            You can customize how often this happens.
          </Typography>
        </TimelineContent>
      </TimelineItem>

      <TimelineItem sx={listItemSx}>
        <TimelineSeparator>
          <TimelineDot>
            <CommentIcon htmlColor={theme.palette.background.default} />
          </TimelineDot>
          <TimelineConnector />
        </TimelineSeparator>
        <TimelineContent>
          <Typography>You perform a simple action in response</Typography>
          <Typography variant="body2" color="text.secondary">
            Thus, you confirm that you are alive.
          </Typography>
        </TimelineContent>
      </TimelineItem>

      <TimelineItem sx={listItemSx}>
        <TimelineSeparator>
          <TimelineDot>
            <SignalWifiLost htmlColor={theme.palette.background.default} />
          </TimelineDot>
          <TimelineConnector />
        </TimelineSeparator>
        <TimelineContent>
          <Typography>If you don't respond in time...</Typography>
          <Typography variant="body2" color="text.secondary">
            The deadline is also customizable by you.
          </Typography>
        </TimelineContent>
      </TimelineItem>

      <TimelineItem sx={listItemSx}>
        <TimelineSeparator>
          <TimelineDot>
            <PlayCircleOutlineOutlinedIcon
              htmlColor={theme.palette.background.default}
            />
          </TimelineDot>
        </TimelineSeparator>
        <TimelineContent>
          <Typography>The App executes the workflow</Typography>
          <Typography variant="body2" color="text.secondary">
            Considering you dead, it fulfills your last will.
          </Typography>
        </TimelineContent>
      </TimelineItem>
    </Timeline>
  );
};

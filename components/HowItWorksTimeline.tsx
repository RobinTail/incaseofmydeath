'use client';

import { Box, Typography, useMediaQuery, useTheme } from '@mui/material';
import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import Icon from '@mui/material/Icon';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';

const steps = [
  {
    icon: 'conversion_path',
    title: 'You create a workflow on GitHub',
    subtitle: 'In a private repo for manual dispatch event.',
  },
  {
    icon: 'fact_check',
    title: 'You grant access to the Application',
    subtitle: 'Only the workflow run permissions needed.',
  },
  {
    icon: 'ring_volume',
    title: 'You activate communication channels',
    subtitle: 'For example, authorize the Telegram bot.',
  },
  {
    icon: 'chat',
    title: 'The App regularly communicates with you',
    subtitle: 'You can customize how often this happens.',
  },
  {
    icon: 'comment',
    title: 'You perform a simple action in response',
    subtitle: 'Thus, you confirm that you are alive.',
  },
  {
    icon: 'wifi_off',
    title: "If you don't respond in time...",
    subtitle: 'The deadline is also customizable by you.',
  },
  {
    icon: 'play_circle',
    title: 'The App executes the workflow',
    subtitle: 'Considering you dead, it fulfills your last will.',
  },
];

export function HowItWorksTimeline() {
  const theme = useTheme();
  const isXS = useMediaQuery(theme.breakpoints.only('xs'));
  const listItemSx = {
    '&::before': { display: 'none' },
    minWidth: isXS ? undefined : '375px',
  };

  return (
    <Box sx={{ mt: 2, mb: 2 }}>
      <Timeline position="right" sx={{ my: 0, py: 0 }}>
        {steps.map((step, index) => (
          <TimelineItem key={index} sx={listItemSx}>
            <TimelineSeparator>
              <TimelineDot>
                <Icon sx={{ color: 'background.default' }}>{step.icon}</Icon>
              </TimelineDot>
              {index < steps.length - 1 && <TimelineConnector />}
            </TimelineSeparator>
            <TimelineContent>
              <Typography>{step.title}</Typography>
              <Typography variant="body2" color="text.secondary">
                {step.subtitle}
              </Typography>
            </TimelineContent>
          </TimelineItem>
        ))}
      </Timeline>
    </Box>
  );
}

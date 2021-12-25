import {
  Box,
  Button,
  Typography,
  useTheme,
  useMediaQuery,
  Link,
} from "@mui/material";
import React from "react";
import { useNavigate } from "react-router-dom";
import { HowItWorksTimeline } from "./HowItWorksTimeline";
import { paths } from "./paths";
import { WorkflowExample } from "./WorkflowExample";

export const Intro = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isXS = useMediaQuery(theme.breakpoints.only("xs"));

  const proceedButton = (
    <Button
      variant="contained"
      onClick={() => navigate(paths.personalArea)}
      fullWidth
      sx={{ mb: 2 }}
      color="primary"
    >
      Let's start
    </Button>
  );

  return (
    <Box>
      <Typography
        variant={isXS ? "h5" : "h4"}
        component="h1"
        gutterBottom
        noWrap
        align="center"
      >
        In Case of my Death
      </Typography>
      <Typography mb={2} variant="subtitle1">
        The Application fulfills your last will by executing a workflow from
        your private repository on GitHub in case of your death. Free from bias,
        blind to your secrets, cold-blooded as machine code.
      </Typography>
      {proceedButton}

      <Typography
        variant={isXS ? "h6" : "h5"}
        component="h2"
        align="center"
        gutterBottom
      >
        Who is it for
      </Typography>
      <Typography gutterBottom>
        The App is intended primarily for programmers and software engineers who
        have an account on GitHub. Recently, the workflow automation system{" "}
        <Link
          href="https://docs.github.com/en/actions"
          target="_blank"
          rel="noopener"
        >
          GitHub Actions
        </Link>{" "}
        has gained great popularity, which this App uses. However, anyone
        interested can create a workflow and use this App.
      </Typography>

      <Typography
        variant={isXS ? "h6" : "h5"}
        component="h2"
        align="center"
        mt={2}
      >
        How it works
      </Typography>

      <HowItWorksTimeline />

      <Typography
        variant={isXS ? "h6" : "h5"}
        component="h2"
        mt={2}
        align="center"
        gutterBottom
      >
        Safety concerns
      </Typography>
      <Typography gutterBottom>
        The App does not read the contents of the repository and the workflow,
        but only initiates its launch in the specified case. Moreover, you can
        use{" "}
        <Link
          href="https://docs.github.com/en/actions/security-guides/encrypted-secrets"
          target="_blank"
          rel="noopener"
        >
          encrypted Action Secrets
        </Link>{" "}
        in the GitHub repository settings for sensitive information. Thus, the
        application is blind and impartial in relation to you, your will and
        your secrets.
      </Typography>

      <Typography
        variant={isXS ? "h6" : "h5"}
        component="h2"
        mt={2}
        align="center"
        gutterBottom
      >
        Exceptional cases warning
      </Typography>
      <Typography gutterBottom>
        The mechanism for determining the fact of death is not ideally accurate.
        There are exceptional cases when the App may fulfill your last will
        while you are legally alive. For example, if you are unconscious, or you
        are in prison, or you lost your phone, or for some other reason you do
        not have access to communication.
      </Typography>

      <Typography
        variant={isXS ? "h6" : "h5"}
        component="h2"
        mt={2}
        align="center"
        gutterBottom
      >
        Legal disclaimer
      </Typography>
      <Typography gutterBottom>
        The App does not replace notarial certification of last will and other
        procedures established by the law of your country for the official
        transfer of property and inheritance rights.
      </Typography>

      <Typography
        variant={isXS ? "h6" : "h5"}
        component="h2"
        mt={2}
        align="center"
        gutterBottom
      >
        Suicide prevention statement
      </Typography>
      <Typography mb={2}>
        In case you are considering using this App due to the fact that you are
        planning suicide, someone should tell you that your life DOES matter.
        You should not be ashamed of who you are, and every decision you ever
        made was right at that time. There is a counseling service in your city
        that can help you cope with a crisis.
      </Typography>

      {proceedButton}

      <WorkflowExample mt={2} />
    </Box>
  );
};

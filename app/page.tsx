"use client";

import {
  Box,
  Button,
  Container,
  Link as MuiLink,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { HowItWorksTimeline } from "@/components/HowItWorksTimeline";
import { WorkflowExample } from "@/components/WorkflowExample";
import { Header } from "@/components/Header";

function ErrorBanner() {
  const searchParams = useSearchParams();
  const errorParam = searchParams.get("error");

  const errorMessage =
    errorParam === "invalid_state"
      ? "Invalid OAuth state. Please try again."
      : errorParam === "no_installation"
        ? "Please install the GitHub App first."
        : errorParam === "oauth_failed"
          ? "OAuth authentication failed. Please try again."
          : null;

  if (!errorMessage) return null;

  return (
    <Box
      sx={{
        p: 2,
        mb: 2,
        bgcolor: "error.dark",
        color: "error.contrastText",
        borderRadius: 1,
        textAlign: "center",
      }}
    >
      {errorMessage}
    </Box>
  );
}

export default function Home() {
  const theme = useTheme();
  const isXS = useMediaQuery(theme.breakpoints.only("xs"));

  return (
    <>
      <Header showHomeButton={false} />
      <Container component="main" maxWidth="xs" sx={{ mt: 10, mb: 8 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Typography
            variant={isXS ? "h5" : "h4"}
            component="h1"
            gutterBottom
            noWrap
            align="center"
          >
            In Case of my Death
          </Typography>

          <Typography mb={2} variant="subtitle1" align="center">
            The Application fulfills your last will by executing a workflow from
            your private repository on GitHub in case of your death. Free from
            bias, blind to your secrets, cold-blooded as machine code.
          </Typography>

          <Button
            variant="contained"
            component={Link}
            href="/api/auth/begin"
            fullWidth
            sx={{ mb: 2 }}
          >
            Let&apos;s start
          </Button>

          <Typography
            variant={isXS ? "h6" : "h5"}
            component="h2"
            align="center"
            gutterBottom
          >
            Who is it for
          </Typography>

          <Typography gutterBottom align="center">
            The App is intended primarily for programmers and software engineers
            who have an account on GitHub. Recently, the workflow automation
            system{" "}
            <MuiLink
              href="https://docs.github.com/en/actions"
              target="_blank"
              rel="noopener"
            >
              GitHub Actions
            </MuiLink>{" "}
            has gained great popularity, which this App uses. However, anyone
            interested can create a workflow and use this App.
          </Typography>

          <Typography
            variant={isXS ? "h6" : "h5"}
            component="h2"
            align="center"
            mt={3}
          >
            How it works
          </Typography>

          <HowItWorksTimeline />

          <Typography
            variant={isXS ? "h6" : "h5"}
            component="h2"
            align="center"
            mt={3}
            gutterBottom
          >
            Safety concerns
          </Typography>

          <Typography gutterBottom align="center">
            The App does not read the contents of the repository and the
            workflow, but only initiates its launch in the specified case.
            Moreover, you can use{" "}
            <MuiLink
              href="https://docs.github.com/en/actions/security-guides/encrypted-secrets"
              target="_blank"
              rel="noopener"
            >
              encrypted Action Secrets
            </MuiLink>{" "}
            in the GitHub repository settings for sensitive information. Thus,
            the application is blind and impartial in relation to you, your will
            and your secrets. The App is{" "}
            <MuiLink href="https://github.com/RobinTail/incaseofmydeath">
              open source
            </MuiLink>
            , so you can check this.
          </Typography>

          <Typography
            variant={isXS ? "h6" : "h5"}
            component="h2"
            align="center"
            mt={3}
            gutterBottom
          >
            Exceptional cases warning
          </Typography>

          <Typography gutterBottom align="center">
            The mechanism for determining the fact of death is not ideally
            accurate. There are exceptional cases when the App may fulfill your
            last will while you are legally alive. For example, if you are
            unconscious, or you are in prison, or you lost your phone, or for
            some other reason you do not have access to communication.
          </Typography>

          <Typography
            variant={isXS ? "h6" : "h5"}
            component="h2"
            align="center"
            mt={3}
            gutterBottom
          >
            Legal disclaimer
          </Typography>

          <Typography gutterBottom align="center">
            The App does not replace notarial certification of last will and
            other procedures established by the law of your country for the
            official transfer of property and inheritance rights.
          </Typography>

          <Typography
            variant={isXS ? "h6" : "h5"}
            component="h2"
            align="center"
            mt={3}
            gutterBottom
          >
            Suicide prevention statement
          </Typography>

          <Typography mb={2} align="center">
            In case you are considering using this App due to the fact that you
            are planning suicide, someone should tell you that your life DOES
            matter. You should not be ashamed of who you are, and every decision
            you ever made was right at that time. There is a counseling service
            in your city that can help you cope with a crisis.
          </Typography>

          <Button
            variant="contained"
            component={Link}
            href="/api/auth/begin"
            fullWidth
            sx={{ mb: 2 }}
          >
            Let&apos;s start
          </Button>

          <WorkflowExample mt={4} />

          <Suspense fallback={null}>
            <ErrorBanner />
          </Suspense>
        </Box>
      </Container>
    </>
  );
}

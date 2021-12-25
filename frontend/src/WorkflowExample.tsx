import { Box, Link, Typography, useMediaQuery, useTheme } from "@mui/material";
import React from "react";
import { CodeSnippet } from "./CodeSnippet";

const exampleWorkflow = `
name: Last will
on: workflow_dispatch
jobs:
  lastWill:
    runs-on: ubuntu-latest
    steps:
    - name: Tell my wife I love her
      uses: dawidd6/action-send-mail@v3.6.0
      with:
        server_address: smtp.mail.mail
        server_port: 465
        username: \${{ secrets.SMTP_LOGIN }}
        password: \${{ secrets.SMTP_PASSWORD }}
        from: Jane Doe <janedoe@mail.mail>
        to: mywife@mail.mail
        subject: My last will
        body: |
          Hello my darling. If you are reading
          these lines, I am most likely dead. In
          this regard, I want to inform you that 
          the years I lived with you were the
          happiest in my life. I love you more
          than schnitzel and potatoes. I am just
          kidding, sorry. To support you in this
          difficult moment, I leave you some
          money between the pages of The Hobbit
          book by J.R.R. Tolkien, which you will
          find in a drawer in my office. Do not
          be discouraged for too long and find
          for yourself someone alive, because
          you deserve to be happy anyway.
`.trim();

interface WorkflowExampleProps {
  mt: number;
}

export const WorkflowExample = ({ mt }: WorkflowExampleProps) => {
  const theme = useTheme();
  const isXS = useMediaQuery(theme.breakpoints.only("xs"));

  return (
    <Box mt={mt}>
      <Typography
        variant={isXS ? "h6" : "h5"}
        component="h2"
        align="center"
        gutterBottom
      >
        How to create the workflow
      </Typography>
      <Typography gutterBottom>
        <Link href="https://github.com/new" target="_blank" rel="noopener">
          Create a new private repository on GitHub
        </Link>{" "}
        in case you do not have one yet.
      </Typography>
      <Typography gutterBottom>
        Commit the file{" "}
        <code
          style={{
            fontSize: "0.85rem",
            padding: `${theme.spacing(0.25)} ${theme.spacing(0.75)}`,
            background: theme.palette.divider,
            borderRadius: theme.shape.borderRadius,
          }}
        >
          .github/workflows/my-last-will.yml
        </code>{" "}
        to the repository with a following content:
      </Typography>

      <CodeSnippet code={exampleWorkflow} language="yaml" />
    </Box>
  );
};

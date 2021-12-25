import {
  Alert,
  IconButton,
  Paper,
  Snackbar,
  Tooltip,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import React from "react";
import { CopyToClipboardButton } from "react-clipboard-button";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/cjs/styles/prism";

interface CodeSnippetProps {
  code: string;
  language: string;
}

export const CodeSnippet = ({ language, code }: CodeSnippetProps) => {
  const theme = useTheme();
  const isXS = useMediaQuery(theme.breakpoints.only("xs"));
  const [isSnackbarOpened, setSnackbarOpened] = React.useState(false);
  const [snackbarContent, setSnackbarContent] = React.useState({
    message: "",
    success: true,
  });

  const closeSnackbar = () => {
    setSnackbarOpened(false);
  };

  return (
    <>
      <Paper
        sx={{
          position: "relative",
          maxWidth: isXS ? `calc(100vw - ${theme.spacing(4)});` : "400px",
          fontSize: theme.typography.caption.fontSize,
        }}
      >
        <CopyToClipboardButton
          text={code}
          style={{
            position: "absolute",
            top: theme.spacing(1),
            right: theme.spacing(1),
          }}
          onSuccess={() => {
            setSnackbarContent({ message: "Copied!", success: true });
            setSnackbarOpened(true);
          }}
          onError={() => {
            setSnackbarContent({ message: "Failed to copy", success: false });
            setSnackbarOpened(true);
          }}
        >
          <Tooltip title="Copy" placement="left" arrow>
            <IconButton>
              <ContentCopyIcon />
            </IconButton>
          </Tooltip>
        </CopyToClipboardButton>
        <ReactMarkdown
          components={{
            pre({ children }) {
              return children;
            },
            code({ node, inline, className, children, ref, ...props }) {
              const match = /language-(\w+)/.exec(className || "");
              return !inline && match ? (
                <SyntaxHighlighter
                  ref={ref as React.LegacyRef<SyntaxHighlighter>}
                  style={theme.palette.mode === "dark" ? atomDark : undefined}
                  language={match[1]}
                  PreTag="div"
                  children={String(children).replace(/\n$/, "")}
                  {...props}
                />
              ) : (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            },
          }}
        >
          {`\`\`\`${language}\n${code}\n\`\`\``}
        </ReactMarkdown>
      </Paper>
      <Snackbar
        open={isSnackbarOpened}
        autoHideDuration={4000}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        onClose={closeSnackbar}
      >
        <Alert
          onClose={closeSnackbar}
          severity={snackbarContent.success ? "success" : "error"}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbarContent.message}
        </Alert>
      </Snackbar>
    </>
  );
};

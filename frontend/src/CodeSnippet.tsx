/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  IconButton,
  Paper,
  Tooltip,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import React from "react";
// @todo fix the the module issue resolved
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { CopyToClipboardButton } from "react-clipboard-button";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ReactMarkdown from "react-markdown";
import SyntaxHighlighter from "react-syntax-highlighter/dist/esm/prism";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { SnackbarContext } from "./context";

interface CodeSnippetProps {
  code: string;
  language: string;
}

export const CodeSnippet = ({ language, code }: CodeSnippetProps) => {
  const theme = useTheme();
  const isXS = useMediaQuery(theme.breakpoints.only("xs"));
  const { showSnackbar } = React.useContext(SnackbarContext);

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
          onSuccess={() => showSnackbar({ message: "Copied!", success: true })}
          onError={() =>
            showSnackbar({ message: "Failed to copy", success: false })
          }
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
            code({ node, inline, className, children, style, ...props }) {
              const match = /language-(\w+)/.exec(className || "");
              return !inline && match ? (
                <SyntaxHighlighter
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
    </>
  );
};

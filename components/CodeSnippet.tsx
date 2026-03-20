"use client";

import { useState, useEffect } from "react";
import { Paper, IconButton, Tooltip, Box } from "@mui/material";
import Icon from "@mui/material/Icon";

interface CodeSnippetProps {
  code: string;
  language: string;
}

export function CodeSnippet({ code, language }: CodeSnippetProps) {
  const [highlighted, setHighlighted] = useState<string>("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    import("shiki").then(async ({ createHighlighter }) => {
      const highlighter = await createHighlighter({
        themes: ["github-dark"],
        langs: [language],
      });
      const html = highlighter.codeToHtml(code, {
        lang: language,
        theme: "github-dark",
      });
      setHighlighted(html);
    });
  }, [code, language]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Paper
      sx={{
        position: "relative",
        overflow: "auto",
        maxWidth: { xs: "calc(100vw - 32px)", sm: 500 },
        "& pre": {
          m: 0,
          p: 2,
          fontSize: "0.75rem !important",
          lineHeight: 1.5,
        },
        "& code": {
          fontFamily: "monospace !important",
        },
      }}
    >
      <Tooltip title={copied ? "Copied!" : "Copy"} placement="left" arrow>
        <IconButton
          onClick={handleCopy}
          sx={{
            position: "absolute",
            top: 1,
            right: 1,
            backgroundColor: "background.paper",
          }}
          size="small"
        >
          <Icon>{copied ? "check" : "content_copy"}</Icon>
        </IconButton>
      </Tooltip>
      <Box dangerouslySetInnerHTML={{ __html: highlighted }} />
    </Paper>
  );
}

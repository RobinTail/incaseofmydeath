"use client";

import { Icon, IconButton, Tooltip } from "@mui/material";
import { usePathname, useRouter } from "next/navigation";
import { useColorScheme } from "@mui/material/styles";

interface HeaderProps {
  showHomeButton?: boolean;
}

export function Header({ showHomeButton = true }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isRoot = pathname === "/";
  const { mode, setMode } = useColorScheme();
  const isDark = mode === "dark";

  return (
    <>
      {showHomeButton && !isRoot && (
        <Tooltip title="Home" placement="right" arrow>
          <IconButton
            onClick={() => router.push("/")}
            sx={{
              position: "fixed",
              top: 16,
              left: 16,
            }}
          >
            <Icon>home</Icon>
          </IconButton>
        </Tooltip>
      )}

      <Tooltip
        title={isDark ? "Light mode" : "Dark mode"}
        placement="left"
        arrow
      >
        <IconButton
          onClick={() => setMode(isDark ? "light" : "dark")}
          sx={{
            position: "fixed",
            top: 16,
            right: 16,
          }}
        >
          <Icon>{isDark ? "brightness_7" : "brightness_4"}</Icon>
        </IconButton>
      </Tooltip>
    </>
  );
}

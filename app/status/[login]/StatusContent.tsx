"use client";

import {
  Alert,
  Box,
  Card,
  CardContent,
  Container,
  Typography,
} from "@mui/material";
import Icon from "@mui/material/Icon";
import Link from "next/link";
import { Header } from "@/components/Header";

interface StatusContentProps {
  login: string;
  isAlive: boolean;
  lastConfirmation: Date;
}

export function StatusContent({
  login,
  isAlive,
  lastConfirmation,
}: StatusContentProps) {
  return (
    <>
      <Header />
      <Container component="main" maxWidth="xs" sx={{ mt: 12, mb: 8 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Typography variant="h4" component="h1" gutterBottom>
            {login}&apos;s Status
          </Typography>

          <Card
            sx={{
              width: "100%",
              bgcolor: isAlive ? "success.dark" : "error.dark",
              color: "white",
              mb: 2,
            }}
          >
            <CardContent sx={{ textAlign: "center", py: 4 }}>
              <Icon sx={{ fontSize: 80, mb: 2 }}>
                {isAlive ? "favorite" : "heart_broken"}
              </Icon>
              <Typography
                variant="h3"
                component="div"
                sx={{ fontWeight: "bold" }}
              >
                {isAlive ? "ALIVE" : "DEAD"}
              </Typography>
              <Typography sx={{ mt: 2 }}>
                Last confirmed: {new Date(lastConfirmation).toLocaleString()}
              </Typography>
            </CardContent>
          </Card>

          <Alert severity="info" sx={{ width: "100%", mb: 2 }}>
            This status is public because the owner chose to share it.
          </Alert>

          <Link href="/" passHref>
            <Typography
              sx={{
                color: "primary.main",
                textDecoration: "underline",
                cursor: "pointer",
              }}
            >
              Create your own status page
            </Typography>
          </Link>
        </Box>
      </Container>
    </>
  );
}

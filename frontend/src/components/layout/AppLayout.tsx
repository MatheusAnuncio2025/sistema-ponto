// Arquivo: frontend/src/components/layout/AppLayout.tsx

import React, { ReactNode, useState } from "react";
import {
  AppBar,
  Box,
  Container,
  IconButton,
  Toolbar,
  Typography,
  useMediaQuery,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useTheme } from "@mui/material/styles";
import AppSidebar from "./AppSidebar";

const drawerWidth = 260;

export default function AppLayout({ children }: { children: ReactNode }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen((prev) => !prev);
  };

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        background:
          "radial-gradient(circle at 20% 20%, rgba(0,149,48,0.12), transparent 35%), radial-gradient(circle at 80% 0%, rgba(11,93,42,0.12), transparent 35%), #f5f7f5",
      }}
    >
      <AppSidebar
        drawerWidth={drawerWidth}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        variantMobile={isMobile}
      />

      <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <AppBar position="sticky" color="transparent" elevation={0}>
          <Toolbar>
            {isMobile && (
              <IconButton onClick={handleDrawerToggle} edge="start" sx={{ mr: 1 }}>
                <MenuIcon />
              </IconButton>
            )}
            <Typography variant="h6" fontWeight={600}>
              Registro de Ponto
            </Typography>
          </Toolbar>
        </AppBar>

        <Container
          maxWidth="lg"
          sx={{
            py: 4,
            flex: 1,
            animation: "fadeInUp 0.45s ease",
            "@keyframes fadeInUp": {
              from: { opacity: 0, transform: "translateY(8px)" },
              to: { opacity: 1, transform: "translateY(0)" },
            },
          }}
        >
          {children}
        </Container>
      </Box>
    </Box>
  );
}

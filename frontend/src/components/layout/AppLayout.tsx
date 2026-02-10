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
import ViewSidebarIcon from "@mui/icons-material/ViewSidebar";
import { useTheme } from "@mui/material/styles";
import AppSidebar from "./AppSidebar";

const drawerWidth = 260;
const collapsedWidth = 80;

export default function AppLayout({ children }: { children: ReactNode }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen((prev) => !prev);
  };

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        background: "#f5f7f5",
      }}
    >
      <AppBar
        position="fixed"
        color="transparent"
        elevation={0}
        sx={(theme) => ({
          zIndex: theme.zIndex.drawer + 1,
          ml: { xs: 0, md: collapsed ? `${collapsedWidth}px` : `${drawerWidth}px` },
          width: {
            xs: "100%",
            md: `calc(100% - ${collapsed ? collapsedWidth : drawerWidth}px)`,
          },
        })}
      >
        <Toolbar>
          {isMobile && (
            <IconButton onClick={handleDrawerToggle} edge="start" sx={{ mr: 1 }}>
              <MenuIcon />
            </IconButton>
          )}
          {!isMobile && (
            <IconButton
              onClick={() => setCollapsed((prev) => !prev)}
              edge="start"
              sx={{ mr: 1 }}
            >
              <ViewSidebarIcon />
            </IconButton>
          )}
          <Typography variant="h6" fontWeight={600}>
            Registro de Ponto
          </Typography>
        </Toolbar>
      </AppBar>

      <AppSidebar
        drawerWidth={drawerWidth}
        collapsedWidth={collapsedWidth}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((prev) => !prev)}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        variantMobile={isMobile}
      />

      <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Toolbar />
        <Box
          sx={{
            py: { xs: 3, md: 4 },
            px: { xs: 2, md: 4 },
            flex: 1,
            width: "100%",
            animation: "fadeInUp 0.45s ease",
            "@keyframes fadeInUp": {
              from: { opacity: 0, transform: "translateY(8px)" },
              to: { opacity: 1, transform: "translateY(0)" },
            },
          }}
        >
          <Box sx={{ maxWidth: 1400, mx: "auto", width: "100%" }}>
            {children}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

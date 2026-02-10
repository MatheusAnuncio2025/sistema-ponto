// Arquivo: frontend/src/components/layout/AppSidebar.tsx

import React from "react";
import {
  Avatar,
  Box,
  Divider,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
  Button,
  Collapse,
  Tooltip,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import HistoryIcon from "@mui/icons-material/History";
import BarChartIcon from "@mui/icons-material/BarChart";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import PeopleIcon from "@mui/icons-material/People";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const navItems = [
  { label: "Dashboard", path: "/" },
  { label: "Histórico", path: "/historico" },
  { label: "Relatórios", path: "/relatorios" },
];

export default function AppSidebar({
  drawerWidth,
  collapsedWidth,
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onClose,
  variantMobile,
}: {
  drawerWidth: number;
  collapsedWidth: number;
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onClose: () => void;
  variantMobile: boolean;
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "US";

  const [adminOpen, setAdminOpen] = React.useState(true);

  const drawerContent = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Stack
        direction="row"
        spacing={2}
        alignItems="center"
        sx={{ p: 2, justifyContent: collapsed ? "center" : "flex-start" }}
      >
        <Avatar sx={{ bgcolor: "primary.main", width: 38, height: 38 }}>
          {initials}
        </Avatar>
        {!collapsed && (
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" fontWeight={600} noWrap>
              {user?.name}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {user?.role}
            </Typography>
          </Box>
        )}
      </Stack>

      <Divider />

      <List sx={{ px: 1, py: 1 }}>
        {navItems.map((item) => {
          const selected =
            location.pathname === item.path ||
            (item.path !== "/" && location.pathname.startsWith(item.path));
          const button = (
            <ListItemButton
              key={item.path}
              selected={selected}
              onClick={() => {
                navigate(item.path);
                if (variantMobile) onClose();
              }}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                transition: "all 0.18s ease",
                "&:hover": {
                  backgroundColor: "rgba(15,23,42,0.04)",
                },
                "&.Mui-selected": {
                  backgroundColor: "rgba(0,149,48,0.12)",
                  color: "primary.main",
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                {item.path === "/" && <DashboardIcon color={selected ? "primary" : "inherit"} />}
                {item.path === "/historico" && (
                  <HistoryIcon color={selected ? "primary" : "inherit"} />
                )}
                {item.path === "/relatorios" && (
                  <BarChartIcon color={selected ? "primary" : "inherit"} />
                )}
              </ListItemIcon>
              {!collapsed && <ListItemText primary={item.label} />}
            </ListItemButton>
          );
          return collapsed ? (
            <Tooltip key={item.path} title={item.label} placement="right">
              {button}
            </Tooltip>
          ) : (
            button
          );
        })}
      </List>

      {user &&
        ["admin", "hr", "supervisor", "coordinator"].includes(user.role) && (
        <>
          <Divider />
          <List sx={{ px: 1, py: 1 }}>
            <ListItemButton
              onClick={() => setAdminOpen((prev) => !prev)}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                transition: "all 0.18s ease",
                "&:hover": { backgroundColor: "rgba(15,23,42,0.04)" },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <SettingsIcon />
              </ListItemIcon>
              {!collapsed && (
                <>
                  <ListItemText primary="Administração" />
                  {adminOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </>
              )}
            </ListItemButton>
          </List>
          <Collapse in={adminOpen || collapsed} timeout="auto" unmountOnExit>
            <List sx={{ px: 1, py: 1 }}>
            <ListItemButton
              onClick={() => {
                navigate("/admin/dashboard");
                if (variantMobile) onClose();
              }}
              selected={location.pathname.startsWith("/admin/dashboard")}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                transition: "all 0.18s ease",
                "&:hover": {
                  backgroundColor: "rgba(15,23,42,0.04)",
                },
                "&.Mui-selected": {
                  backgroundColor: "rgba(0,149,48,0.12)",
                  color: "primary.main",
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <DashboardIcon />
              </ListItemIcon>
              {!collapsed && <ListItemText primary="Dashboard Admin" />}
            </ListItemButton>
            <ListItemButton
              onClick={() => {
                navigate("/admin/work-locations");
                if (variantMobile) onClose();
              }}
              selected={location.pathname.startsWith("/admin/work-locations")}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                transition: "all 0.18s ease",
                "&:hover": {
                  backgroundColor: "rgba(15,23,42,0.04)",
                },
                "&.Mui-selected": {
                  backgroundColor: "rgba(0,149,48,0.12)",
                  color: "primary.main",
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <LocationOnIcon />
              </ListItemIcon>
              {!collapsed && <ListItemText primary="Locais Permitidos" />}
            </ListItemButton>
            <ListItemButton
              onClick={() => {
                navigate("/admin/work-schedules");
                if (variantMobile) onClose();
              }}
              selected={location.pathname.startsWith("/admin/work-schedules")}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                transition: "all 0.18s ease",
                "&:hover": {
                  backgroundColor: "rgba(15,23,42,0.04)",
                },
                "&.Mui-selected": {
                  backgroundColor: "rgba(0,149,48,0.12)",
                  color: "primary.main",
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <CalendarMonthIcon />
              </ListItemIcon>
              {!collapsed && <ListItemText primary="Escalas" />}
            </ListItemButton>
            <ListItemButton
              onClick={() => {
                navigate("/admin/users");
                if (variantMobile) onClose();
              }}
              selected={location.pathname.startsWith("/admin/users")}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                transition: "all 0.18s ease",
                "&:hover": {
                  backgroundColor: "rgba(15,23,42,0.04)",
                },
                "&.Mui-selected": {
                  backgroundColor: "rgba(0,149,48,0.12)",
                  color: "primary.main",
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <PeopleIcon />
              </ListItemIcon>
              {!collapsed && <ListItemText primary="Usuários" />}
            </ListItemButton>
            <ListItemButton
              onClick={() => {
                navigate("/admin/settings");
                if (variantMobile) onClose();
              }}
              selected={location.pathname.startsWith("/admin/settings")}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                transition: "all 0.18s ease",
                "&:hover": {
                  backgroundColor: "rgba(15,23,42,0.04)",
                },
                "&.Mui-selected": {
                  backgroundColor: "rgba(0,149,48,0.12)",
                  color: "primary.main",
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <SettingsIcon />
              </ListItemIcon>
              {!collapsed && <ListItemText primary="Configurações" />}
            </ListItemButton>
          </List>
          </Collapse>
        </>
      )}

      <Box sx={{ mt: "auto", p: 2 }}>
        <Button
          variant="text"
          color="inherit"
          startIcon={<LogoutIcon />}
          onClick={logout}
          sx={{
            justifyContent: collapsed ? "center" : "flex-start",
            width: "100%",
          }}
        >
          {!collapsed && "Sair"}
        </Button>
      </Box>
    </Box>
  );

  return (
    <Drawer
      variant={variantMobile ? "temporary" : "permanent"}
      open={variantMobile ? mobileOpen : true}
      onClose={onClose}
      sx={{
        width: collapsed ? collapsedWidth : drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: collapsed ? collapsedWidth : drawerWidth,
          boxSizing: "border-box",
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
}

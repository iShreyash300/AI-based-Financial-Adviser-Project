import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import {
  Avatar,
  Box,
  Divider,
  Stack,
  Typography,
} from "@mui/material";

import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import AnalyticsOutlinedIcon from "@mui/icons-material/AnalyticsOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";

const menuItems = [
  {
    name: "Dashboard",
    icon: <DashboardOutlinedIcon />,
    path: "/dashboard",
  },
  {
    name: "Expenses",
    icon: <AnalyticsOutlinedIcon />,
    path: "/expenses",
  },
  {
    name: "Budget",
    icon: <ReceiptLongOutlinedIcon />,
  },
  {
    name: "Revenues",
    icon: <SettingsOutlinedIcon />,
  },
  {
    name: "Predictions",
    icon: <SettingsOutlinedIcon />,
  },
  {
    name: "Health score",
    icon: <SettingsOutlinedIcon />,
  },
  {
    name: "Growth Plans",
    icon: <SettingsOutlinedIcon />,
  },
  {
    name: "Reports",
    icon: <SettingsOutlinedIcon />,
  },
];

const Sidebar = () => {
  const [active, setActive] = useState("Dashboard");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const current = menuItems.find(
      (item) => item.path === location.pathname
    );

    if (current) {
      setActive(current.name);
    }
  }, [location.pathname]);

  return (
    <Box
      sx={{
        width: {
          xs: "100%",
          md: "260px",
        },
        minHeight: "100%",
        overflowY: "visible",
        display: "flex",
        flexDirection: {
          xs: "row",
          md: "column",
        },
        justifyContent: {
          xs: "space-around",
          md: "space-between",
        },
        alignItems: {
          xs: "center",
          md: "stretch",
        },
        p: {
          xs: 1,
          md: 2,
        },
        transition: "0.3s",
        background: {
          xs: "#2a2d3a",
          md: "#fff",
        },
        borderTop: {
          xs: "1px solid #3a3d4a",
          md: "none",
        },
        borderRight: {
          xs: "none",
          md: "1px solid #eee",
        },
      }}
    >
      {/* TOP SECTION - DESKTOP ONLY */}

      <Box sx={{ display: { xs: "none", md: "block" } }}>
        {/* LOGO */}

        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
          sx={{
            mb: 5,
            px: 1,
          }}
        >
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: "12px",
              background:
                "linear-gradient(135deg, #5B5FEF 0%, #7B61FF 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: 700,
              fontSize: "18px",
            }}
          >
            F
          </Box>

          <Typography
            sx={{
              fontSize: "1.4rem",
              fontWeight: 800,
              color: "#111",
            }}
          >
            FinAI
          </Typography>
        </Stack>
      </Box>

      {/* MENU */}

      <Stack
        direction={{ xs: "row", md: "column" }}
        spacing={{ xs: 0, md: 1 }}
        sx={{
          width: "100%",
          flex: { xs: 1, md: "auto" },
          justifyContent: { xs: "space-around", md: "flex-start" },
        }}
      >
        {menuItems.map((item) => (
          <Stack
            key={item.name}
            direction={{ xs: "column", md: "row" }}
            alignItems="center"
            spacing={{ xs: 3, md: 2 }}
            onClick={() => {
              if (item.path) {
                navigate(item.path);
              }
              setActive(item.name);
            }}
            sx={{
              width: "100%",
              py: 1.5,
              px: {
                xs: 0,
                md: 2,
              },
              borderRadius: "14px",
              cursor: "pointer",
              transition: "0.3s",
              justifyContent: { xs: "center", md: "flex-start" },

              background:
                active === item.name
                  ? {
                    xs: "transparent",
                    md: "linear-gradient(90deg, #5B5FEF 0%, #7B61FF 100%)",
                  }
                  : "transparent",

              color:
                active === item.name
                  ? {
                    xs: "#7B61FF",
                    md: "#fff",
                  }
                  : {
                    xs: "#999",
                    md: "#555",
                  },

              "&:hover": {
                background:
                  active === item.name
                    ? {
                      xs: "transparent",
                      md: "linear-gradient(90deg, #5B5FEF 0%, #7B61FF 100%)",
                    }
                    : { xs: "transparent", md: "#f5f5ff" },
              },
            }}
          >
            <Box
              sx={{
                fontSize: {
                  xs: "24px",
                  md: "20px",
                },
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {item.icon}
            </Box>

            <Typography
              sx={{
                display: {
                  xs: "none",
                  md: "block",
                },
                fontSize: "15px",
                fontWeight: 600,
              }}
            >
              {item.name}
            </Typography>
          </Stack>
        ))}
      </Stack>

      {/* BOTTOM SECTION - DESKTOP ONLY */}

      <Box sx={{ display: { xs: "none", md: "block" } }}>
        <Divider sx={{ mb: 2 }} />

        {/* USER */}

        <Stack
          direction="row"
          alignItems="center"
          spacing={1.5}
          sx={{
            p: 1,
            borderRadius: "12px",
            "&:hover": {
              background: "#f8f8ff",
            },
          }}
        >
          <Avatar
            sx={{
              bgcolor: "#5B5FEF",
              width: 42,
              height: 42,
            }}
          >
            R
          </Avatar>

          <Box>
            <Typography
              sx={{
                fontSize: "14px",
                fontWeight: 700,
                color: "#111",
              }}
            >
              Rishil Patel
            </Typography>

            <Typography
              sx={{
                fontSize: "12px",
                color: "#777",
              }}
            >
              Admin
            </Typography>
          </Box>
        </Stack>

        {/* LOGOUT */}

        <Stack
          direction="row"
          alignItems="center"
          spacing={2}
          sx={{
            mt: 2,
            p: 1.5,
            borderRadius: "14px",
            cursor: "pointer",
            color: "#ff4d4f",
            transition: "0.3s",

            "&:hover": {
              background: "#fff1f0",
            },
          }}
        >
          <LogoutOutlinedIcon />

          <Typography
            sx={{
              fontSize: "15px",
              fontWeight: 600,
            }}
          >
            Logout
          </Typography>
        </Stack>
      </Box>
    </Box>
  );
};

export default Sidebar;
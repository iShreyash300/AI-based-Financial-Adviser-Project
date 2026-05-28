import React, { useState } from "react";

import {
  Avatar,
  Box,
  Divider,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";

import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import AnalyticsOutlinedIcon from "@mui/icons-material/AnalyticsOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import MenuIcon from "@mui/icons-material/Menu";

const Sidebar = () => {
  const [active, setActive] =
    useState("Dashboard");

  const menuItems = [
    {
      name: "Dashboard",
      icon: <DashboardOutlinedIcon />,
    },
    {
      name: "Analytics",
      icon: <AnalyticsOutlinedIcon />,
    },
    {
      name: "Reports",
      icon: <ReceiptLongOutlinedIcon />,
    },
    {
      name: "Settings",
      icon: <SettingsOutlinedIcon />,
    },
  ];

  return (
    <Box
      sx={{
        width: {
          xs: "80px",
          md: "260px",
        },
        height: "100vh",
        background: "#fff",
        borderRight: "1px solid #eee",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        p: 2,
        transition: "0.3s",
      }}
    >
      {/* TOP SECTION */}

      <Box>
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
              display: {
                xs: "none",
                md: "block",
              },
              fontSize: "1.4rem",
              fontWeight: 800,
              color: "#111",
            }}
          >
            FinAI
          </Typography>
        </Stack>

        {/* MENU */}

        <Stack spacing={1}>
          {menuItems.map((item) => (
            <Stack
              key={item.name}
              direction="row"
              alignItems="center"
              spacing={2}
              onClick={() =>
                setActive(item.name)
              }
              sx={{
                p: 1.5,
                borderRadius: "14px",
                cursor: "pointer",
                transition: "0.3s",

                background:
                  active === item.name
                    ? "linear-gradient(90deg, #5B5FEF 0%, #7B61FF 100%)"
                    : "transparent",

                color:
                  active === item.name
                    ? "#fff"
                    : "#555",

                "&:hover": {
                  background:
                    active === item.name
                      ? "linear-gradient(90deg, #5B5FEF 0%, #7B61FF 100%)"
                      : "#f5f5ff",
                },
              }}
            >
              {item.icon}

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
      </Box>

      {/* BOTTOM SECTION */}

      <Box>
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

          <Box
            sx={{
              display: {
                xs: "none",
                md: "block",
              },
            }}
          >
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
              display: {
                xs: "none",
                md: "block",
              },
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
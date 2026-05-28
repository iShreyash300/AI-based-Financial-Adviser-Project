import React, { useState } from "react";

import {
    AppBar,
    Avatar,
    Box,
    Button,
    Drawer,
    IconButton,
    List,
    ListItem,
    ListItemText,
    Stack,
    Toolbar,
    Typography,
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";

import { useNavigate } from "react-router-dom";

const Navbar = ({ isLogin }) => {
    const [openDrawer, setOpenDrawer] =
        useState(false);

    const navigate = useNavigate();

    // NAV ITEMS

    const navItems = [
        {
            name: "Home",
            path: "/",
        },
        {
            name: "About",
            path: "/about",
        },
        {
            name: "Services",
            path: "/services",
        },
        {
            name: "Features",
            path: "/features",
        },
    ];

    // HANDLE NAVIGATION

    const handleNavigate = (path) => {
        navigate(path);

        setOpenDrawer(false);
    };

    return (
        <>
            {/* ================= NAVBAR ================= */}

            {/* HIDE NAVBAR WHEN USER LOGIN */}

            {!isLogin && (
                <AppBar
                    position="static"
                    elevation={0}
                    sx={{
                        zIndex: 999,
                        background: "#fff",
                        borderBottom: "1px solid #eee",
                        px: {
                            xs: 1,
                            md: 3,
                        },
                        filter: "drop-shadow(0px 2px 4px rgba(0,0,0,0.1))",
                    }}
                >
                    <Toolbar
                        sx={{
                            display: "flex",
                            justifyContent:
                                "space-between",
                            minHeight: "75px",
                        }}
                    >
                        {/* LEFT SIDE */}

                        <Stack
                            direction="row"
                            alignItems="center"
                            spacing={4}
                        >
                            {/* MOBILE MENU */}

                            <IconButton
                                sx={{
                                    display: {
                                        xs: "flex",
                                        md: "none",
                                    },
                                }}
                                onClick={() =>
                                    setOpenDrawer(true)
                                }
                            >
                                <MenuIcon />
                            </IconButton>

                            {/* LOGO */}

                            <Typography
                                sx={{
                                    fontSize: "1.6rem",
                                    fontWeight: 800,
                                    color: "#5B5FEF",
                                    cursor: "pointer",
                                }}
                                onClick={() =>
                                    navigate("/")
                                }
                            >
                                FinAI
                            </Typography>

                            {/* DESKTOP MENU */}

                            <Stack
                                direction="row"
                                spacing={3}
                                sx={{
                                    display: {
                                        xs: "none",
                                        md: "flex",
                                    },
                                    alignItems: "center",
                                }}
                            >
                                {navItems.map((item) => (
                                    <Typography
                                        key={item.name}
                                        onClick={() =>
                                            handleNavigate(
                                                item.path
                                            )
                                        }
                                        sx={{
                                            fontSize: "15px",
                                            fontWeight: 500,
                                            color: "#555",
                                            cursor: "pointer",
                                            transition: "0.3s",

                                            "&:hover": {
                                                color: "#5B5FEF",
                                            },
                                        }}
                                    >
                                        {item.name}
                                    </Typography>
                                ))}
                            </Stack>
                        </Stack>

                        {/* RIGHT SIDE */}

                        <Stack
                            direction="row"
                            spacing={2}
                            alignItems="center"
                        >
                            {/* LOGIN BUTTON */}

                            <Button
                                variant="contained"
                                onClick={() =>
                                    navigate("/login")
                                }
                                sx={{
                                    textTransform: "none",
                                    borderRadius: "10px",
                                    px: 3,
                                    height: "45px",
                                    fontWeight: 700,
                                    background:
                                        "linear-gradient(90deg, #5B5FEF 0%, #7B61FF 100%)",

                                    "&:hover": {
                                        background:
                                            "linear-gradient(90deg, #4D52E8 0%, #694BFF 100%)",
                                    },
                                }}
                            >
                                Login
                            </Button>
                        </Stack>
                    </Toolbar>
                </AppBar>
            )}

            {/* ================= USER TOPBAR ================= */}

            {/* SHOW USER PROFILE WHEN LOGIN */}

            {isLogin && (
                <AppBar
                    position="static"
                    elevation={0}
                    sx={{
                        background: "#fff",
                        borderBottom: "1px solid #eee",
                        px: 3,
                    }}
                >
                    <Toolbar
                        sx={{
                            display: "flex",
                            justifyContent:
                                "space-between",
                            minHeight: "75px",
                        }}
                    >
                        {/* TITLE */}

                        <Typography
                            sx={{
                                fontSize: "1.5rem",
                                fontWeight: 800,
                                color: "#5B5FEF",
                            }}
                        >
                            Financial Dashboard
                        </Typography>

                        {/* USER PROFILE */}

                        <Stack
                            direction="row"
                            spacing={1.5}
                            alignItems="center"
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
                    </Toolbar>
                </AppBar>
            )}

            {/* ================= MOBILE DRAWER ================= */}

            <Drawer
                anchor="left"
                open={openDrawer}
                onClose={() =>
                    setOpenDrawer(false)
                }
            >
                <Box
                    sx={{
                        width: 250,
                        p: 2,
                    }}
                >
                    {/* LOGO */}

                    <Typography
                        sx={{
                            fontSize: "1.5rem",
                            fontWeight: 800,
                            color: "#5B5FEF",
                            mb: 3,
                        }}
                    >
                        FinAI
                    </Typography>

                    {/* MENU */}

                    <List>
                        {navItems.map((item) => (
                            <ListItem
                                button
                                key={item.name}
                                onClick={() =>
                                    handleNavigate(
                                        item.path
                                    )
                                }
                                sx={{
                                    borderRadius: "10px",

                                    "&:hover": {
                                        background: "#f5f5ff",
                                    },
                                }}
                            >
                                <ListItemText
                                    primary={item.name}
                                />
                            </ListItem>
                        ))}
                    </List>
                </Box>
            </Drawer>
        </>
    );
};

export default Navbar;
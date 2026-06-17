// eslint-disable-next-line 
import React, { useState, useEffect } from "react";
import axios from "axios";

import {
    AppBar,
    Avatar,
    Box,
    Button,
    // Drawer,
    // IconButton,
    // List,
    // ListItem,
    // ListItemText,
    Stack,
    Toolbar,
    Typography,
} from "@mui/material";

// import MenuIcon from "@mui/icons-material/Menu";

import { useNavigate } from "react-router-dom";

import finlogo from "../../../src/assetes/Finlogo.png";
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";


const Navbar = ({ isLogin }) => {
    // const [openDrawer, setOpenDrawer] =
    //     useState(false);

    const navigate = useNavigate();

    const handleLogout = () => {


        localStorage.removeItem("token");
        localStorage.removeItem("isLogin");
        localStorage.removeItem("user");

        navigate("/login");



        // navigate("/");

        // window.location.reload();
    };

    // NAV ITEMS

    // const navItems = [
    //     {
    //         name: "Home",
    //         path: "/",
    //     },
    //     {
    //         name: "About",
    //         path: "/about",
    //     },
    //     {
    //         name: "Services",
    //         path: "/services",
    //     },
    //     {
    //         name: "Features",
    //         path: "/features",
    //     },
    // ];

    // HANDLE NAVIGATION

    // const handleNavigate = (path) => {
    //     navigate(path);

    //     // setOpenDrawer(false);
    // };

    const [user, setUser] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) return;

        axios
            .get("http://localhost:5000/api/auth/profile", {
                headers: { Authorization: token },
            })
            .then((res) => {
                setUser(res.data.user || null);
            })
            .catch(() => setUser(null));
    }, []);

    return (
        <>
            {/* ================= NAVBAR ================= */}

            {/* HIDE NAVBAR WHEN USER LOGIN */}

            {!isLogin && (
                <AppBar

                    elevation={0}
                    sx={{
                        // position: "fixed",
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

                            {/* <IconButton
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
                            </IconButton> */}

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

                            {/* <Stack
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
                            </Stack> */}
                        </Stack>

                        {/* RIGHT SIDE */}

                        <Stack
                            direction="row"
                            spacing={2}
                            sx={{ justifyContent: "center", alignItems: "center" }}
                        >
                            {/* LOGIN BUTTON */}

                            <Button
                                variant="outlined"
                                onClick={() =>
                                    navigate("/login")
                                }
                                sx={{
                                    textTransform: "none",
                                    borderRadius: "10px",
                                    px: 3,
                                    height: "38px",
                                    fontWeight: 700,
                                    borderColor: "#5B5FEF",
                                    borderWidth: "1.5px",
                                    color: "#5B5FEF ",
                                    // background:
                                    //     "linear-gradient(90deg, #5B5FEF 0%, #7B61FF 100%)",

                                    "&:hover": {
                                        boxShadow: "0px 4px 15px rgba(91, 95, 239, 0.4)",
                                        // background:
                                        //     "linear-gradient(90deg, #4D52E8 0%, #694BFF 100%)",
                                    },
                                }}
                            >
                                Login
                            </Button>
                            <Button
                                variant="contained"
                                onClick={() =>
                                    navigate("/signup")
                                }
                                sx={{

                                    display: { xs: "none", md: "flex" },
                                    textTransform: "none",
                                    borderRadius: "24px",
                                    px: 3,
                                    height: "33px",
                                    width: "150px",
                                    justifyContent: "center",
                                    alignItems: "center",

                                    background:
                                        "linear-gradient(90deg, #5B5FEF 0%, #7B61FF 100%)",

                                    "&:hover": {
                                        background:
                                            "linear-gradient(90deg, #4D52E8 0%, #694BFF 100%)",
                                    },
                                }}
                            >
                                Get Started   <ArrowRightAltIcon />
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
                        px: {
                            xs: "auto",
                            md: 3,
                        },
                        position: { md: "sticky", xs: "fixed" },
                        zIndex: "1"
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

                        {/* <Typography
                            sx={{
                                fontSize: "1.5rem",
                                fontWeight: 800,
                                color: "#5B5FEF",
                            }}
                        >
                            FinAI Dashboard
                        </Typography> */}
                        <Stack sx={{ justifyContent: "center", alignItems: "center" }}>
                            <img src={finlogo} alt="FinAI Logo" style={{ width: "100px", height: "auto" }} />
                        </Stack>

                        {/* USER PROFILE */}

                        <Stack
                            direction="row"
                            spacing={1.5}
                            sx={{ justifyContent: "center", alignItems: "center", cursor: "pointer" }}
                            onClick={() => navigate("/profile")}
                        >
                            <Avatar
                                sx={{
                                    bgcolor: "#5B5FEF",
                                    width: 42,
                                    height: 42,
                                }}
                            >
                                {user?.name?.charAt(0)}
                            </Avatar>

                            <Box sx={{ display: { xs: "none", md: "block" } }}>
                                <Typography
                                    sx={{
                                        fontSize: "14px",
                                        fontWeight: 700,
                                        color: "#111",
                                    }}
                                >
                                    {user?.name}
                                </Typography>
                            </Box>

                            {/* LOGOUT BUTTON */}

                            <Button
                                variant="outlined"
                                color="error"
                                onClick={handleLogout}
                                sx={{
                                    textTransform: "none",
                                    fontWeight: 600,
                                    borderRadius: "24px",
                                    width: "10px",
                                }}
                            >
                                <LogoutOutlinedIcon />
                            </Button>
                        </Stack>
                    </Toolbar>
                </AppBar>
            )}

            {/* ================= MOBILE DRAWER ================= */}


        </>
    );
};

export default Navbar;



//  <Drawer
//                 anchor="left"
//                 open={openDrawer}
//                 onClose={() =>
//                     setOpenDrawer(false)
//                 }
//             >
//                 <Box
//                     sx={{
//                         width: 250,
//                         p: 2,
//                     }}
//                 >
//                     {/* LOGO */}

//                     <Typography
//                         sx={{
//                             fontSize: "1.5rem",
//                             fontWeight: 800,
//                             color: "#5B5FEF",
//                             mb: 3,
//                         }}
//                     >
//                         FinAI
//                     </Typography>

//                     {/* MENU */}

//                     <List>
//                         {navItems.map((item) => (
//                             <ListItem
//                                 button
//                                 key={item.name}
//                                 onClick={() =>
//                                     handleNavigate(
//                                         item.path
//                                     )
//                                 }
//                                 sx={{
//                                     borderRadius: "10px",

//                                     "&:hover": {
//                                         background: "#f5f5ff",
//                                     },
//                                 }}
//                             >
//                                 <ListItemText
//                                     primary={item.name}
//                                 />
//                             </ListItem>
//                         ))}
//                     </List>
//                 </Box>
//             </Drawer>
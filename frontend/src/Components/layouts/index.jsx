// import React from "react";
// import Header from "./navbar";
// import Sidebar from "./sidebar";
// import { Box } from "@mui/material";

// const Layout = ({ children }) => {

//     const isLogin =
//         localStorage.getItem("isLogin");
//     return (
//         <>
//             <Box sx={{
//                 width: "100%",

//             }}>
//                 <Header isLogin={isLogin} />
//                 {isLogin && <Sidebar />}
//                 <Box sx={{ height: "100vh", }}  >{children}</Box>
//             </Box>

//         </>
//     );
// };

// export default Layout;



import React from "react";

import { Box } from "@mui/material";

import Header from "./navbar";
import Sidebar from "./sidebar";

const Layout = ({ children }) => {

    const isLogin =
        localStorage.getItem("isLogin");

    return (
        <>
            <Box
                sx={{
                    minHeight: "100vh",
                    background: "#f5f7fb",
                }}
            >
                {/* HEADER */}

                <Header isLogin={isLogin} />

                {/* MAIN LAYOUT */}

                <Box
                    sx={{
                        display: "flex",
                        width: "100%",
                        flexDirection: { xs: "column-reverse", md: "row" },
                    }}
                >
                    {/* SIDEBAR */}

                    {isLogin && (
                        <Box
                            sx={{
                                minWidth: { md: "250px", xs: "100%" },
                                // height: "100vh",
                                // overflowY: "visible",
                                borderRight: { xs: "none", md: "1px solid #eee" },
                                borderTop: { xs: "1px solid #eee", md: "none" },
                                position: { xs: "fixed", md: "relative" },
                                bottom: { xs: "0", md: "0" },

                                zIndex: { md: 0, xs: 10 },
                                // background: { xs: "#2a2d3a", md: "#fff" },
                                // Hide scrollbar for Chrome, Safari and Opera
                                '&::-webkit-scrollbar': {
                                    display: 'none',
                                },
                                // Hide scrollbar for IE, Edge and Firefox
                                msOverflowStyle: 'none',
                                scrollbarWidth: 'none',
                            }}
                        >
                            <Sidebar />
                        </Box>
                    )}

                    {/* PAGE CONTENT */}

                    <Box
                        sx={{
                            flex: 1,
                            overflow: "visible",
                            minHeight: {
                                xs: "auto",
                                md: "calc(100vh - 75px)",
                            },
                            py: 8,
                        }}
                    >
                        {children}
                    </Box>
                </Box>
            </Box>
        </>
    );
};

export default Layout;



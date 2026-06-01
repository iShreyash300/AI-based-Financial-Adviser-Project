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
                                height: "auto",
                                overflowY: "visible",
                                borderRight: { xs: "none", md: "1px solid #eee" },
                                borderTop: { xs: "1px solid #eee", md: "none" },
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
                            // p: 2,
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



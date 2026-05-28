import React from "react";
import Header from "./navbar";
import Sidebar from "./sidebar";
import { Box } from "@mui/material";

const Layout = ({ children }) => {


    return (
        <>
            <Box sx={{
                width: "100%",

            }}>
                <Header />
                {/* <Sidebar /> */}
                <Box sx={{ height: "100vh", }}  >{children}</Box>
            </Box>

        </>
    );
};

export default Layout;



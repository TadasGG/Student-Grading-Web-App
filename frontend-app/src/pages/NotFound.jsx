import { useNavigate } from "react-router-dom";
import {usePageTitle} from "../hooks/usePageTitle.jsx";
import {useEffect} from "react";
import ErrorOutlinedIcon from '@mui/icons-material/ErrorOutlined';

import "../styles/main.css"
import "../styles/components.css"
import {ListItemIcon} from "@mui/material";
import {grey} from "@mui/material/colors";

export default function HomePage() {
    const navigate = useNavigate();

    const title = usePageTitle();

    useEffect(() => {
        document.title = `${title} — DigiGrade`;
    }, [title]);

    const returnHome = () => {
        navigate("/");
    };

    return (
        <div className="page-root">
            <div className="flex flex-col bg-[#fff] self-center p-[56px] items-center gap-[16px] mt-[2rem] rounded-[20px] shadow-xl">
                <ListItemIcon><ErrorOutlinedIcon sx={{ fontSize: 55, color: grey[900]  }} /></ListItemIcon>
                <h1 className="title">404</h1>
                <p className="sub">The page you were looking for does not exist!</p>
                <button className="button-primary" onClick={returnHome}>Return Home</button>
            </div>
        </div>
    );
}

import { useNavigate } from "react-router-dom";
import "../styles/main.css"
import {Button} from "@mui/material";
import {usePageTitle} from "../hooks/usePageTitle.jsx";
import {useEffect} from "react";

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
        <>
            <div className="page-root">
                <div className="card">
                    <div className="">
                    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24"><path fill="currentColor" d="M12.713 16.713Q13 16.425 13 16t-.288-.712T12 15t-.712.288T11 16t.288.713T12 17t.713-.288M11 13h2V7h-2zm1 9q-2.075 0-3.9-.788t-3.175-2.137T2.788 15.9T2 12t.788-3.9t2.137-3.175T8.1 2.788T12 2t3.9.788t3.175 2.137T21.213 8.1T22 12t-.788 3.9t-2.137 3.175t-3.175 2.138T12 22"/></svg>
                    </div>
                    <h1 className="title">404</h1>
                    <p className="sub">The page you were looking for does not exist!</p>
                    <button className="button-primary" onClick={returnHome}>Return Home</button>
                </div>
            </div>
        </>
    );
}

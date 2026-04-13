import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import SideNav from "./SideNav";
import { usePageTitle } from "../hooks/usePageTitle.js";
import "../styles/main.css";
import "../styles/loginpage.css";
import PageTitle from "./PageTitle.jsx";

export default function Layout() {
    const [navOpen, setNavOpen] = useState(false);
    const title = usePageTitle();

    useEffect(() => {
        document.title = `${title} — DigiGrade`;
    }, [title]);

    return (
        <div className="layout">
            <SideNav isOpen={navOpen} onClose={() => setNavOpen(false)} />
            <div className="layout-body">
                <header className="topbar">
                    <button
                        className="hamburger"
                        onClick={() => setNavOpen(v => !v)}
                        aria-label="Toggle navigation"
                    >
                        <span />
                        <span />
                        <span />
                    </button>
                    <span className="topbar-title">{title}</span>
                </header>
                <main className="main-content">
                    <PageTitle title={title} className="page-title desktop-only" />
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
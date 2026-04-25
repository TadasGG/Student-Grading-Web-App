import { NavLink } from "react-router-dom";
import UserProfile from "./UserProfile.jsx";
import { ExpandMore, ExpandLess } from "@mui/icons-material";
import {useState} from "react";

import "../styles/main.css";


export default function SideNav({ isOpen, onClose }) {
    const [studentsOpen, setStudentsOpen] = useState(false);
    const [coursesOpen, setCoursesOpen] = useState(false);

    return (
        <>
            <div
                className={`sidenav-overlay ${isOpen ? "visible" : ""}`}
                onClick={onClose}
            />
            <nav className={`sidenav ${isOpen ? "open" : ""}`}>
                <div className="sidenav-logo">DigiGrades</div>
                <ul className="sidenav-links">
                    <li>
                        <NavLink to="/" end onClick={onClose}>Dashboard</NavLink>
                    </li>

                    <li>
                        <button
                            className="sidenav-group-toggle"
                            onClick={() => setStudentsOpen(v => !v)}
                        >
                            Students
                            {studentsOpen ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
                        </button>
                        {studentsOpen && (
                            <ul className="sidenav-sublinks">
                                <li><NavLink to="/students" onClick={onClose}>All students</NavLink></li>
                                <li><NavLink to="/groups" onClick={onClose}>Groups</NavLink></li>
                            </ul>
                        )}
                    </li>
                    <li>
                        <NavLink to="/courses" onClick={onClose}>Courses</NavLink>
                        <NavLink to="/users" end onClick={onClose}>Users</NavLink>
                    </li>
                </ul>
                <UserProfile />
            </nav>
        </>
    );
}
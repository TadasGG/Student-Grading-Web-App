import {NavLink, useNavigate} from "react-router-dom";
import {Avatar, Divider, ListItemIcon, Menu, MenuItem} from "@mui/material";
import {useState} from "react";
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';

import "../styles/components.css";


export default function UserProfile() {
    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem("user"));

    const [anchor, setAnchor] = useState(null);

    const handleOpen = (e) => setAnchor(e.currentTarget);
    const handleClose = () => setAnchor(null);

    const handleLogout = async () => {
        await fetch('/api/logout/', {
            method: "POST",
            credentials: "include",  // important — sends the cookie
        });
        localStorage.removeItem("user");
        navigate("/login");
    };

    return (
        <>
            <NavLink className="user-profile" onClick={handleOpen}>
                <Avatar className="user-profile-avatar">{user?.first_name[0] + user?.last_name[0]}</Avatar>
                <div>
                    <h3>{user?.first_name} {user?.last_name}</h3>
                    <p>({user?.role.charAt(0).toUpperCase() + user?.role.slice(1)})</p>
                </div>
            </NavLink>

            <Menu
                id="user-menu"
                anchorEl={anchor}
                open={Boolean(anchor)}
                onClose={handleClose}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
                transformOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <MenuItem onClick={() => { handleClose(); navigate("/profile"); }}>
                    <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon>
                    My profile
                </MenuItem>
                <Divider sx={{ borderColor: 'rgba(255,255,255,0.2) !important' }} />
                <MenuItem onClick={handleLogout}>
                    <ListItemIcon><LogoutIcon fontSize="small" /></ListItemIcon>
                    Sign out
                </MenuItem>
            </Menu>
        </>
    );
}

import {useEffect, useState} from "react";
import { useNavigate } from "react-router-dom";
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';

import "../styles/loginpage.css"
import {IconButton, ListItemIcon, TextField, InputLabel, FormControl, OutlinedInput, InputAdornment} from "@mui/material";
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';


import {usePageTitle} from "../hooks/usePageTitle.js";

export default function LoginPage() {
    const navigate = useNavigate();

    const title = usePageTitle();

    useEffect(() => {
        document.title = `${title} — DigiGrade`;
    }, [title]);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError]       = useState("");
    const [loading, setLoading]   = useState(false);
    const [showPass, setShowPass] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!email.trim())  { setError("Email is required."); return; }
        if (!password)         { setError("Password is required."); return; }

        setLoading(true);
        try {
            const res = await fetch('/api/login/', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
                credentials: "include",
            });

            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(`Wrong email or password`);
            }

            const data = await res.json().catch(() => ({}));
            localStorage.setItem("user", JSON.stringify({
                id: data.id,
                email: data.email,
                role: data.role,
                first_name: data.first_name,
                last_name: data.last_name,
            }));
            navigate("/");

        } catch (err) {
            setError(err.message || "Login failed. Check your credentials and try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="login-root">
                <div className="login-panel">
                    <div className="logo-mark">
                        <img src="/favicon.svg" width="40" height="40" alt="DigiGrade logo" />
                    </div>

                    <h1 className="login-heading">Sign in to continue</h1>

                    <form onSubmit={handleSubmit} noValidate>
                        <div className="field-group">
                            <TextField
                                id="username"
                                type="text"
                                size="small"
                                className="field-input"
                                label="Email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                            />
                        </div>

                        <div className="field-group">
                            <div className="pass-wrap">
                                <FormControl size="small" className="field-input">
                                    <InputLabel>Password</InputLabel>
                                    <OutlinedInput
                                        id="password"
                                        type={showPass ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        endAdornment={
                                            <InputAdornment position="end">
                                                <IconButton
                                                    aria-label={
                                                        showPass ? 'hide the password' : 'display the password'
                                                    }
                                                    onClick={() => setShowPass(v => !v)}
                                                    edge="end"
                                                >
                                                    {showPass ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                                </IconButton>
                                            </InputAdornment>
                                        }
                                        label="Password"
                                    />
                                </FormControl>
                            </div>
                        </div>

                        {error && (
                            <div className="error-box" role="alert">
                                <div className="error-icon">
                                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                        <path d="M5 2v3M5 7.5v.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
                                    </svg>
                                </div>
                                <span className="error-text">{error}</span>
                            </div>
                        )}

                        <button type="submit" className="submit-btn" disabled={loading}>
                            {loading ? (<><span className="spinner" /> Signing in…</>) : "Sign in"}
                        </button>
                    </form>
                </div>

                <div className="login-bg">
                    <div className="bg-grid" />
                    <div className="bg-circle" style={{ width: 480, height: 480, top: -120, right: -80, opacity: 0.6 }} />
                    <div className="bg-circle" style={{ width: 280, height: 280, bottom: 40, left: 60, opacity: 0.4 }} />
                    <div className="bg-quote">
                        <div className="bg-quote-mark">"</div>
                        <p className="bg-quote-text">Study hard, for the well is deep<br />and our brains are shallow.</p>
                    </div>
                </div>
            </div>
        </>
    );
}

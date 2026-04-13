import {BrowserRouter, Routes, Route, Navigate, useNavigate} from "react-router-dom";
import {LoginPage, HomePage, NotFound, UsersPage, EditUser, NewUser} from "./pages";
import { useState, useEffect } from "react";

import Layout from "./components/Layout";
import {AlertProvider} from "./context/AlertContext.jsx";

function ProtectedRoute({ children }) {
    const [auth, setAuth] = useState("loading");

    const navigate = useNavigate();

    useEffect(() => {
        fetch("/api/me/", { credentials: "include" })
            .then(res => {
                if (res.ok) {
                    res.json().then(data => {
                        localStorage.setItem("user", JSON.stringify(data));
                        if (data.must_change_password) {
                            setAuth("ok");
                            console.log("PST: " + data.must_change_password);
                            navigate("/changepassword");
                        }
                        setAuth("ok");
                    });
                } else {
                    localStorage.removeItem("user");
                    setAuth("denied");
                }
            })
            .catch(() => setAuth("denied"));
    }, []);

    if (auth === "loading") return null;
    if (auth === "denied") return <Navigate to="/login" replace />;
    return children;
}

export default function App() {
    return (
        <AlertProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />

                    <Route
                        element={
                            <ProtectedRoute>
                                <Layout />
                            </ProtectedRoute>
                        }
                    >
                        <Route path="/" element={<HomePage />} />
                        <Route path="/users" element={<UsersPage />} />
                        <Route path="/users/:id" element={<EditUser />} />
                        <Route path="/users/new" element={<NewUser />} />
                    </Route>

                    <Route path="/404" element={<NotFound />} />

                    {/* Catch-all: redirect unknown paths to 404 */}
                    <Route path="*" element={<Navigate to="/404" replace />} />
                </Routes>
            </BrowserRouter>
        </AlertProvider>
    );
}

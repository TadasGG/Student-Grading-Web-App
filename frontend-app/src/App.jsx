import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LoginPage, HomePage, NotFound } from "./pages";
import { useState, useEffect } from "react";

import Layout from "./components/Layout";

function ProtectedRoute({ children }) {
    const [auth, setAuth] = useState("loading");

    useEffect(() => {
        fetch("/api/me/", { credentials: "include" })
            .then(res => {
                if (res.ok) {
                    res.json().then(data => {
                        localStorage.setItem("user", JSON.stringify(data));
                        setAuth("ok");
                    });
                } else {
                    localStorage.removeItem("user");
                    setAuth("denied");
                }
            })
            .catch(() => setAuth("denied"));
    }, []);

    if (auth === "loading") return null; // or a spinner
    if (auth === "denied") return <Navigate to="/login" replace />;
    return children;
}

export default function App() {
    return (
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
                </Route>

                <Route path="/404" element={<NotFound />} />

                {/* Catch-all: redirect unknown paths to home */}
                <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

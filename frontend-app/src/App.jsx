import {BrowserRouter, Routes, Route, Navigate, useLocation} from "react-router-dom";
import {
    LoginPage,
    HomePage,
    NotFound,
    UsersPage,
    EditUser,
    NewUser,
    MyProfile,
    ChangePassword,
    CoursesPage, EditCourse
} from "./pages";
import { useState, useEffect } from "react";

import Layout from "./components/Layout";
import {AlertProvider} from "./context/AlertContext.jsx";

function ProtectedRoute({ children }) {

    const location = useLocation();
    const [auth, setAuth] = useState("loading");

    useEffect(() => {
        fetch("/api/me/", { credentials: "include" })
            .then(res => {
                if (res.ok) {
                    res.json().then(data => {
                        localStorage.setItem("user", JSON.stringify(data));
                        if (data.must_change_password) {
                            setAuth("change_password");
                        } else {
                            setAuth("ok");
                        }
                    });
                } else {
                    localStorage.removeItem("user");
                    setAuth("denied");
                }
            })
            .catch(() => setAuth("denied"));
    }, [location.pathname]);

    if (auth === "loading") return null;
    if (auth === "change_password") {
        if (!location.pathname.startsWith("/changepassword")) {
            return <Navigate to="/changepassword" replace />;
        }
        return children;
    }
    if (auth === "ok") {
        if (location.pathname.startsWith("/changepassword")) {
            return <Navigate to="/" replace />;
        }
        return children;
    }
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
                        path="/changepassword"
                        element={
                            <ProtectedRoute>
                                <ChangePassword />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        element={
                            <ProtectedRoute>
                                <Layout />
                            </ProtectedRoute>
                        }
                    >
                        <Route path="/" element={<HomePage />} />

                        <Route path="/myprofile" element={<MyProfile />} />

                        <Route path="/users" element={<UsersPage />} />
                        <Route path="/users/:id" element={<EditUser />} />
                        <Route path="/users/new" element={<NewUser />} />

                        <Route path="/courses" element={<CoursesPage />} />
                        <Route path="/courses/:id" element={<EditCourse />} />
                    </Route>

                    <Route path="/404" element={<NotFound />} />

                    {/* Catch-all: redirect unknown paths to 404 */}
                    <Route path="*" element={<Navigate to="/404" replace />} />
                </Routes>
            </BrowserRouter>
        </AlertProvider>
    );
}

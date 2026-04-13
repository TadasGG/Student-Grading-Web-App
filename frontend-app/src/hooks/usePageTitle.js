import { useLocation } from "react-router-dom";

const titles = {
    "/": "Dashboard",
    "/login": "Log In",
    "/users": "Users",
    "/404": "404",
    "/students": "Students",
    "/groups": "Groups",
    "/grades": "Grades",
    "/profile": "My Profile",
};

export function usePageTitle() {
    const { pathname } = useLocation();

    // handle dynamic routes like /students/1
    if (pathname.match(/^\/students\/\d+$/)) return "Student Details";

    // handle dynamic routes like /groups/1
    if (pathname.match(/^\/groups\/\d+$/)) return "Group Details";

    // handle dynamic routes like /users/1
    if (pathname.match(/^\/users\/\d+$/)) return "User Details";

    return titles[pathname] || "DigiGrade";
}
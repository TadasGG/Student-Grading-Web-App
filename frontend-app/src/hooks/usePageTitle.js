import { useLocation } from "react-router-dom";

const titles = {
    "/": "Dashboard",
    "/login": "Log In",
    "/changepassword": "Change your password",
    "/users": "Users",
    "/courses": "Courses",
    "/404": "404",
    "/students": "Students",
    "/groups": "Groups",
    "/grades": "Grades",
    "/myprofile": "My Profile",
};

export function usePageTitle() {
    const { pathname } = useLocation();

    // handle dynamic routes like /students/1
    if (pathname.match(/^\/students\/\d+$/)) return "Student Details";

    // handle dynamic routes like /groups/1
    if (pathname.match(/^\/groups\/\d+$/)) return "Group Details";

    // handle dynamic routes like /users/1
    if (pathname.match(/^\/users\/\d+$/)) return "User Details";

    // handle dynamic routes like /courses/1
    if (pathname.match(/^\/courses\/\d+$/)) return "Course Details";

    return titles[pathname] || "DigiGrade";
}
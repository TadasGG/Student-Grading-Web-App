import "../../styles/main.css";
import "../../styles/components.css";
import {
    Table,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    TableBody,
    TableCell,
    TextField,
    IconButton, MenuItem, DialogTitle, DialogContent, DialogActions, Dialog
} from "@mui/material";
import * as React from 'react';
import {useNavigate, useSearchParams} from "react-router-dom";
import Filters from "../../components/Filters.jsx";
import EditIcon from '@mui/icons-material/Edit';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from "@mui/icons-material/Delete";
import {useAlert} from "../../context/AlertContext.jsx";
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

export default function CoursesPage() {
    const [courses, setCourses] = React.useState([]);
    const [count, setCount] = React.useState(0);

    const [searchParams, setSearchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    const semester = searchParams.get('semester') || '';
    const teacher = searchParams.get('teacher') || '';
    const date_from = searchParams.get('date_from') || '';
    const date_to = searchParams.get('date_to') || '';
    const page = parseInt(searchParams.get('page') || '1') - 1;

    const navigate = useNavigate();

    const { showAlert } = useAlert();

    const [selectedCourse, setSelectedCourse] = React.useState(null);
    const [activeConfirmOpen, setActiveConfirmOpen] = React.useState(false);

    const columns = [
        { id: 'course_name', label: 'Name', minWidth: 0 },
        { id: 'course_description', label: 'Description', minWidth: 0 },
        { id: 'semester', label: 'Semester', minWidth: 0 },
        { id: 'teacher_name', label: 'Teacher', minWidth: 0 },
        { id: 'created_at', label: 'Created at', minWidth: 0 },
        { id: 'action_buttons', label: '', minWidth: 0},
    ];

    const [semesters, setSemesters] = React.useState([]);
    React.useEffect(() => {
        fetch(`/api/courses?semesters=true`, {
            credentials: 'include'
        })
            .then(res => res.json())
            .then(data => {
                setSemesters(data)
            })
    }, []);

    const [teachers, setTeachers] = React.useState([]);
    React.useEffect(() => {
        fetch(`/api/courses?teachers=true`, {
            credentials: 'include'
        })
            .then(res => res.json())
            .then(data => {
                setTeachers(data)
            })
    }, []);

    const [localFilters, setLocalFilters] = React.useState({
        q: query,
        semester: semester,
        teacher: teacher,
        date_from: date_from,
        date_to: date_to,
    });

    function fetchCourses() {
        return fetch(`/api/courses?semester=${page + 1}&semester=${semester}&teacher=${teacher}&date_from=${date_from}&date_to=${date_to}&q=${query}`, {
            credentials: 'include'
        })
            .then(res => res.json())
            .then(data => {
                setCourses(data.results)
                setCount(data.count)
            })
    }

    React.useEffect(() => {
        fetchCourses();
    }, [searchParams]);

    const handleChangePage = (event, newPage) => {
        setSearchParams({ ...Object.fromEntries(searchParams), page: newPage + 1 });
    };

    const resetFilters = () => {
        setSearchParams();

        setLocalFilters({
            q: '',
            semester: '',
            teacher: '',
            date_from: '',
            date_to: '',
        });
    };

    const applySearch = (e) => {
        e.preventDefault();

        const params = { page: 1 };

        if (localFilters.q) params.q = localFilters.q;
        setSearchParams(params);
    }

    const applyFilters = () => {
        const params = { page: 1 };

        if (localFilters.semester) params.semester = localFilters.semester;
        if (localFilters.teacher) params.teacher = localFilters.teacher;
        if (localFilters.date_from) params.date_from = localFilters.date_from;
        if (localFilters.date_to) params.date_to = localFilters.date_to;

        setSearchParams(params);
    };

    function editCourse(courseId) {
        navigate(`/courses/${courseId}`);
    };

    function deleteCourse(courseId) {
        return fetch(`/api/courses/${courseId}`, {
            method: 'DELETE',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            }
        })
        .then(res => {
            if (res.ok) {
                fetchCourses().then(
                    showAlert('Course deleted successfully.', 'success')
                );
            } else {
                showAlert('Something went wrong.', 'error');
                throw new Error('failed');
            }
        })
    }

    return (
        <div className="page-root">
            <div className="flex flex-col md:flex-row gap-3 min-h-0">
                <div className="flex flex-col md:w-1/4 md:order-2 gap-3">
                    <button className="button-primary hidden md:block" onClick={() => navigate('/courses/new')}><AddCircleIcon sx={{ color: "#fff" }}/> New Course</button>

                    <Filters onApply={applyFilters} onReset={resetFilters}>
                        <div className="flex md:flex-col gap-2">
                            <TextField
                                select
                                className="w-1/2 md:w-full"
                                value={localFilters.semester}
                                onChange={(e) =>
                                    setLocalFilters({ ...localFilters, semester: e.target.value })
                                }
                                label="Semester"
                                size="small"
                            >
                                <MenuItem value="">--</MenuItem>
                                {semesters.map((option) => (
                                    <MenuItem key={option} value={option}>
                                        {option}
                                    </MenuItem>
                                ))}
                            </TextField>

                            <TextField
                                select
                                className="w-1/2 md:w-full"
                                value={localFilters.teacher}
                                onChange={(e) =>
                                    setLocalFilters({ ...localFilters, teacher: e.target.value })
                                }
                                label="Teacher"
                                size="small"
                            >
                                <MenuItem value="">--</MenuItem>
                                {teachers.map((option) => (
                                    <MenuItem key={option.teacher__id} value={option.teacher__id}>
                                        {option.teacher__first_name} {option.teacher__last_name}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </div>

                        <div className="flex md:flex-col gap-2">
                            <DatePicker
                                label="Date From"
                                format="DD/MM/YYYY"
                                value={localFilters.date_from ? dayjs(localFilters.date_from) : null}
                                onChange={(newValue) =>
                                    setLocalFilters({ ...localFilters, date_from: newValue ? newValue.format('YYYY-MM-DD') : '' })
                                }
                                slotProps={{ textField: { size: 'small', className: 'w-full' } }}
                            />

                            <DatePicker
                                label="Date To"
                                format="DD/MM/YYYY"
                                value={localFilters.date_to ? dayjs(localFilters.date_to) : null}
                                onChange={(newValue) =>
                                    setLocalFilters({ ...localFilters, date_to: newValue ? newValue.format('YYYY-MM-DD') : '' })
                                }
                                slotProps={{ textField: { size: 'small', className: 'w-full' } }}
                            />
                        </div>
                    </Filters>
                </div>
                <div className="rounded-md flex flex-col md:w-3/4 md:order-1 items-center gap-3">
                    <div className="flex w-full gap-2">
                        <form className="flex w-full gap-1" onSubmit={applySearch}>
                            <TextField
                                className="w-full rounded"
                                value={localFilters.q}
                                onChange={(e) =>
                                    setLocalFilters({ ...localFilters, q: e.target.value })
                                }
                                label="Search"
                                placeholder="..."
                                size="small"
                            />

                            <button className="button-primary" onClick={applySearch}><SearchIcon /></button>
                        </form>

                        <button className="button-primary md:hidden block min-w-fit" onClick={() => navigate('/courses/new')}><AddCircleIcon sx={{ color: "#fff" }}/> New Course</button>
                    </div>

                    <TableContainer className="rounded-md border" sx={{ flex: 1, overflow: 'auto' }}>
                        <Table stickyHeader aria-label="sticky table">
                            <TableHead>
                                <TableRow>
                                    {columns.map((column) => (
                                        <TableCell
                                            key={column.id}
                                            align={column.align}
                                            style={{ minWidth: column.minWidth, color: "#fff", background: "#1a1a1ad3"}}
                                        >
                                            {column.label}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {courses.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={columns.length} align="center">
                                            No Data...
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    courses.map((course) => (
                                        <TableRow hover role="checkbox" tabIndex={-1} key={course.id}>
                                            {columns.map((column) => (
                                                <TableCell key={column.id} align={column.align}>
                                                    {column.id === 'action_buttons'
                                                        ? <div className="flex w-fit">
                                                            <IconButton onClick={() => editCourse(course.id)}><EditIcon /></IconButton>
                                                            <IconButton onClick={() => { setSelectedCourse(course); setActiveConfirmOpen(true); }}><DeleteIcon /></IconButton>
                                                        </div>
                                                        : column.id === 'created_at'
                                                            ? new Date(course.created_at).toLocaleDateString()
                                                        : course[column.id] ?? (
                                                            <p className="italic text-gray-400">N/A</p>
                                                        )
                                                    }
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <TablePagination
                        rowsPerPageOptions={[]}
                        component="div"
                        count={count}
                        rowsPerPage={20}
                        page={page}
                        onPageChange={handleChangePage}
                    />
                </div>
            </div>

            <Dialog open={activeConfirmOpen} onClose={() => setActiveConfirmOpen(false)}>
                <DialogTitle>Confirm</DialogTitle>
                <DialogContent>
                    <p>Are you sure you want to delete this course?</p>
                </DialogContent>
                <DialogActions sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <button className="button-primary min-w-fit m-3 md:w-1/12 w-1/6" onClick={() => setActiveConfirmOpen(false)}>Cancel</button>
                    <button className="button-primary min-w-fit m-3 md:w-1/12 w-1/6" onClick={() => {
                        deleteCourse(selectedCourse.id);
                        setActiveConfirmOpen(false);
                    }}>Confirm</button>
                </DialogActions>
            </Dialog>
        </div>
    );
}
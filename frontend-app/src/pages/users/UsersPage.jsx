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
    MenuItem, Button, IconButton, InputAdornment, FormControl, InputLabel, OutlinedInput
} from "@mui/material";
import * as React from 'react';
import {useNavigate, useSearchParams} from "react-router-dom";
import Filters from "../../components/Filters.jsx";
import EditIcon from '@mui/icons-material/Edit';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import SearchIcon from '@mui/icons-material/Search';

export default function UsersPage() {
    const [users, setUsers] = React.useState([]);
    const [count, setCount] = React.useState(0);

    const [searchParams, setSearchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    const first_name = searchParams.get('first_name') || '';
    const last_name = searchParams.get('last_name') || '';
    const role = searchParams.get('role') || '';
    const is_active = searchParams.get('is_active') || '';
    const page = parseInt(searchParams.get('page') || '1') - 1;

    const navigate = useNavigate();

    const columns = [
        { id: 'first_name', label: 'Name', minWidth: 0 },
        { id: 'last_name', label: 'Surname', minWidth: 0 },
        { id: 'email', label: 'Email', minWidth: 0 },
        { id: 'role', label: 'Role', minWidth: 0 },
        { id: 'is_active', label: 'Is Active', minWidth: 0 },
        { id: 'action_buttons', label: '', minWidth: 0},
    ];

    const [localFilters, setLocalFilters] = React.useState({
        q: query,
        first_name: first_name,
        last_name: last_name,
        role: role,
        is_active: is_active
    });

    const roles = [
        {
            value: '',
            label: '--',
        },
        {
            value: 'Student',
            label: 'Student',
        },
        {
            value: 'Teacher',
            label: 'Teacher',
        },
        {
            value: 'Admin',
            label: 'Admin',
        },
    ];

    const activity = [
        {
            value: '',
            label: '--',
        },
        {
            value: true,
            label: 'Yes',
        },
        {
            value: false,
            label: 'No',
        }
    ];

    React.useEffect(() => {
        fetch(`/api/user?page=${page + 1}&first_name=${first_name}&last_name=${last_name}&role=${role}&q=${query}&is_active=${is_active}`, {
            credentials: 'include'
        })
            .then(res => res.json())
            .then(data => {
                setUsers(data.results)
                setCount(data.count)
            })
    }, [searchParams]);

    const handleChangePage = (event, newPage) => {
        setSearchParams({ ...Object.fromEntries(searchParams), page: newPage + 1 });
    };

    const resetFilters = () => {
        setSearchParams();

        setLocalFilters({
            q: '',
            first_name: '',
            last_name: '',
            role: '',
            is_active: '',
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

        if (localFilters.first_name) params.first_name = localFilters.first_name;
        if (localFilters.last_name) params.last_name = localFilters.last_name;
        if (localFilters.role) params.role = localFilters.role;
        if (localFilters.is_active !== '') params.is_active = localFilters.is_active;

        setSearchParams(params);
    };

    function editUser(userId) {
        navigate(`/users/${userId}`);
    };

    return (
        <div className="page-root">
            <div className="flex flex-col md:flex-row gap-3 min-h-0">
                <div className="flex flex-col md:w-1/4 md:order-2 gap-3">
                    <button className="button-primary" onClick={() => navigate('/users/new')}><AddCircleIcon sx={{ color: "#fff" }}/> New User</button>

                    <Filters onApply={applyFilters} onReset={resetFilters}>
                        <div className="flex md:flex-col gap-2">
                            <TextField
                                className="w-1/2 md:w-full"
                                value={localFilters.first_name}
                                onChange={(e) =>
                                    setLocalFilters({ ...localFilters, first_name: e.target.value })
                                }
                                label="Name Search"
                                size="small"
                            />
                        </div>

                        <div className="flex md:flex-col gap-2">
                            <TextField
                                className="w-1/2 md:w-full"
                                value={localFilters.last_name}
                                onChange={(e) =>
                                    setLocalFilters({ ...localFilters, last_name: e.target.value })
                                }
                                label="Surname Search"
                                size="small"
                            />
                            <TextField
                                select
                                className="w-1/2 md:w-full"
                                value={localFilters.role}
                                onChange={(e) =>
                                    setLocalFilters({ ...localFilters, role: e.target.value })
                                }
                                label="Role"
                                size="small"
                            >
                                {roles.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </TextField>
                            <TextField
                                select
                                className="w-1/2 md:w-full"
                                value={localFilters.is_active}
                                onChange={(e) =>
                                    setLocalFilters({ ...localFilters, is_active: e.target.value })
                                }
                                label="Is Active"
                                size="small"
                            >
                                {activity.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </div>
                    </Filters>
                </div>
                <div className="rounded-md flex flex-col md:w-3/4 md:order-1 items-center gap-3">
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
                                {users.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={columns.length} align="center">
                                            No Data...
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    users.map((user) => (
                                        <TableRow hover role="checkbox" tabIndex={-1} key={user.id}>
                                            {columns.map((column) => (
                                                <TableCell key={column.id} align={column.align}>
                                                    {column.id === 'action_buttons'
                                                        ? <IconButton onClick={() => editUser(user.id)}><EditIcon /></IconButton>
                                                        : column.id === 'is_active'
                                                            ? user.is_active ? 'Yes' : 'No'
                                                            : user[column.id]}
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
        </div>
    );
}
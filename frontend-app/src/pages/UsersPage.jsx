import "../styles/main.css";
import "../styles/components.css";
import {
    Table,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    TableBody,
    TableCell,
    TextField,
    MenuItem
} from "@mui/material";
import * as React from 'react';
import {useSearchParams} from "react-router-dom";
import Filters from "../components/Filters.jsx";

const columns = [
    { id: 'first_name', label: 'Name', minWidth: 170 },
    { id: 'last_name', label: 'Surname', minWidth: 170 },
    { id: 'email', label: 'Email', minWidth: 200 },
    { id: 'role', label: 'Role', minWidth: 80 },
    { id: 'action_buttons', label: '', minWidth: 80 },
];

export default function UsersPage() {
    const [users, setUsers] = React.useState([]);
    const [count, setCount] = React.useState(0);

    const [searchParams, setSearchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    const first_name = searchParams.get('first_name') || '';
    const last_name = searchParams.get('last_name') || '';
    const role = searchParams.get('role') || '';
    const page = parseInt(searchParams.get('page') || '1') - 1;


    const params = {};
    const [localFilters, setLocalFilters] = React.useState({
        q: query,
        first_name: first_name,
        last_name: last_name,
        role: role,
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

    React.useEffect(() => {
        fetch(`/api/user?page=${page + 1}&first_name=${first_name}&last_name=${last_name}&role=${role}&q=${query}`, {
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
        });
    };

    const applyFilters = () => {
        const params = { page: 1 };

        if (localFilters.q) params.q = localFilters.q;
        if (localFilters.first_name) params.first_name = localFilters.first_name;
        if (localFilters.last_name) params.last_name = localFilters.last_name;
        if (localFilters.role) params.role = localFilters.role;

        setSearchParams(params);
    };

    return (
        <div className="page-root">
            <div className="page-field flex gap-3 min-h-0">
                <div className="w-3/4 rounded-md flex flex-col items-center">
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
                                {users.map((user) => (
                                    <TableRow hover role="checkbox" tabIndex={-1} key={user.id}>
                                        {columns.map((column) => (
                                            <TableCell key={column.id} align={column.align}>
                                                {user[column.id]}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))}
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
                <div className="flex flex-col w-1/4 gap-2">
                    <Filters onApply={applyFilters} onReset={resetFilters}>
                        <TextField
                            value={localFilters.q}
                            onChange={(e) =>
                                setLocalFilters({ ...localFilters, q: e.target.value })
                            }
                            label="Global Search"
                            size="small"
                        />
                        <TextField
                            value={localFilters.first_name}
                            onChange={(e) =>
                                setLocalFilters({ ...localFilters, first_name: e.target.value })
                            }
                            label="Name Search"
                            size="small"
                        />
                        <TextField
                            value={localFilters.last_name}
                            onChange={(e) =>
                                setLocalFilters({ ...localFilters, last_name: e.target.value })
                            }
                            label="Surname Search"
                            size="small"
                        />
                        <TextField
                            select
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
                    </Filters>
                </div>
            </div>
        </div>
    );
}
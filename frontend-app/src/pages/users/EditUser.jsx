import {useNavigate, useParams} from "react-router-dom";
import {usePageTitle} from "../../hooks/usePageTitle.js";
import {useAlert} from '../../context/AlertContext';
import {useEffect} from "react";

import "../../styles/main.css"
import "../../styles/components.css"
import {
    Autocomplete,
    Dialog, DialogActions,
    DialogContent,
    DialogTitle,
    Divider, FormControl, FormControlLabel, FormGroup, IconButton, InputAdornment,
    MenuItem, OutlinedInput, Switch,
    TextField
} from "@mui/material";
import * as React from "react";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

export default function EditUser() {
    const current_user = JSON.parse(localStorage.getItem("user"));


    const navigate = useNavigate();

    const title = usePageTitle();

    const { id } = useParams();

    const [user, setUser] = React.useState();
    const [groups, setGroup] = React.useState([]);

    const [tempPassword, setTempPassword] = React.useState(null);

    const [activeConfirmOpen, setActiveConfirmOpen] = React.useState(false);

    const roles = [
        { value: 'student', label: 'Student' },
        { value: 'teacher', label: 'Teacher' },
        { value: 'admin', label: 'Admin' },
    ];

    const [form, setForm] = React.useState({
        first_name: '',
        last_name: '',
        email: '',
        role: '',
        student_group: '',
        is_active: '',
    });

    const [emailError, setEmailError] = React.useState(false);
    const { showAlert } = useAlert();

    useEffect(() => {
        document.title = `${title} — DigiGrade`;
    }, [title]);

    React.useEffect(() => {
        fetch(`/api/user/${id}`, {
            credentials: 'include'
        })
            .then(res => res.json())
            .then(data => setUser(data))
    }, [id]);

    React.useEffect(() => {
        fetch(`/api/studentGroups`, {
            credentials: 'include'
        })
            .then(res => res.json())
            .then(data => setGroup(data.results))
    }, [user]);

    React.useEffect(() => {
        if (user) {
            setForm({
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                email: user.email || '',
                role: user.role || '',
                student_group: user.student_group || '',
                is_active: user.is_active || ''
            });
        }
    }, [user]);

    function handleApply() {
        if (!form.email) {
            setEmailError(true);
            return Promise.reject('validation failed');
        }
        setEmailError(false);

        return fetch(`/api/user/${id}`, {
            method: 'PATCH',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(form)
        })
            .then(res => {
                if (res.ok) {
                    showAlert('User updated successfully.', 'success');
                } else {
                    showAlert('Something went wrong.', 'error');
                    throw new Error('failed');
                }
            })
    }

    function handleSubmit() {
        handleApply()
            .then(() => navigate(-1))
            .catch(() => {});
    }

    function resetPassword() {
        fetch(`/api/user/${id}/changepass`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then(res => res.json())
            .then(data => {
                if (data.temporary_password) {
                    setTempPassword(data.temporary_password);
                }
            })
    }

    const [copied, setCopied] = React.useState(false);
    function copyPassword() {
        navigator.clipboard.writeText(tempPassword);
        setCopied(true);
    }

    return (
        <div className="page-root flex flex-col">
            <h1 className="title">Edit User: {user?.first_name} {user?.last_name}</h1>

            <div className="md:flex flex-1 min-h-0 gap-3.5 mt-5">
                <div className="flex flex-col md:w-1/2">
                    <h3 className="mb-8">Personal information</h3>
                    <div className="flex flex-col items-center gap-5">
                        <TextField
                            className="w-2/3"
                            label="First Name"
                            variant="outlined"
                            value={form.first_name}
                            onChange={(e) => setForm({ ...form, first_name: e.target.value })} />
                        <TextField
                            className="w-2/3"
                            label="Last Name"
                            variant="outlined"
                            value={form.last_name}
                            onChange={(e) => setForm({ ...form, last_name: e.target.value })} />
                        <TextField
                            className="w-2/3"
                            required
                            label="Email"
                            variant="outlined"
                            value={form.email}
                            error={emailError}
                            helperText={emailError ? 'Email is required!' : ''}
                            onChange={(e) => {
                                setForm({ ...form, email: e.target.value });
                                if (e.target.value) setEmailError(false);
                            }}
                        />
                        <TextField
                            select
                            error={current_user?.id === user?.id}
                            className="w-2/3"
                            disabled={current_user?.id === user?.id}
                            helperText={current_user?.id === user?.id ? "You cannot edit your role!" : ""}
                            label="Role"
                            value={form.role}
                            onChange={(e) =>
                                setForm({ ...form, role: e.target.value })
                            }
                        >
                            {roles.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </TextField>

                        {form.role === 'student' && (
                            <Autocomplete
                                className="w-2/3"
                                options={groups}
                                getOptionLabel={(option) => option.group_name}
                                value={groups.find(g => g.id === form.student_group) || null}
                                onChange={(e, newValue) => setForm({ ...form, student_group: newValue ? newValue.id : '' })}
                                renderInput={(params) => <TextField {...params} label="Student Group" />}
                            />
                        )}
                    </div>
                </div>

                <Divider className="hidden md:block" orientation="vertical" flexItem sx={{ borderColor: 'rgba(0,0,0,0.4)' }} />
                <Divider className="block md:hidden p-2" orientation="horizontal" sx={{ borderColor: 'rgba(0,0,0,0.4)' }} />

                <div className="md:w-1/2">
                    <h3 className="mb-8">Admininstrator options</h3>
                    <div className="flex flex-col items-center gap-5">
                        <button className="button-primary min-w-fit my-2 md:w-1/12 w-1/6" onClick={resetPassword}>Reset Password</button>
                        <FormGroup>
                            <FormControlLabel
                                control={<Switch checked={form.is_active} />}
                                onChange={() => setActiveConfirmOpen(true)}
                                label="Is Active?"
                            />
                        </FormGroup>
                    </div>
                </div>
            </div>

            <div className="flex w-full justify-between mt-auto">
                <button className="button-primary min-w-fit my-2 md:w-1/12 w-1/6" onClick={() => navigate(-1)}>Back</button>

                <div className="flex gap-3">
                    <button className="button-primary min-w-fit my-2 md:w-1/12 w-1/6" onClick={handleApply}>Apply</button>
                    <button className="button-primary min-w-fit my-2 md:w-1/12 w-1/6" onClick={handleSubmit}>Submit</button>
                </div>
            </div>

            <Dialog open={activeConfirmOpen} onClose={() => setActiveConfirmOpen(false)}>
                <DialogTitle>Confirm</DialogTitle>
                <DialogContent>
                    <p>Are you sure you want to {form.is_active ? 'deactivate' : 'activate'} this user?</p>
                </DialogContent>
                <DialogActions sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <button className="button-primary min-w-fit m-3 md:w-1/12 w-1/6" onClick={() => setActiveConfirmOpen(false)}>Cancel</button>
                    <button className="button-primary min-w-fit m-3 md:w-1/12 w-1/6" onClick={() => {
                        setForm({ ...form, is_active: !form.is_active });
                        setActiveConfirmOpen(false);
                    }}>Confirm</button>
                </DialogActions>
            </Dialog>

            <Dialog open={tempPassword !== null} onClose={() => setTempPassword(null)}>
                <DialogTitle className="flex bg-[#1a1a1ad3] text-[#fff] justify-center">Temporary Password</DialogTitle>
                <DialogContent className="mt-3">
                    <p>The temporary password for <strong>{user?.email}</strong> is:</p>
                    <FormControl variant="outlined" fullWidth>
                        <OutlinedInput
                            value={tempPassword}
                            readOnly
                            endAdornment={
                                <InputAdornment position="end">
                                    <IconButton onClick={copyPassword} edge="end">
                                        <ContentCopyIcon />
                                    </IconButton>
                                </InputAdornment>
                            }
                        />
                        {copied && (
                            <p className="self-center">Password has been copied!</p>
                        )}
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <button className="button-primary min-w-fit md:w-1/12 w-1/6" onClick={() => {setTempPassword(null); setCopied(false)}}>Close</button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

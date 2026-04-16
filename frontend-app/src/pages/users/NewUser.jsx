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
    FormControl, IconButton, InputAdornment,
    MenuItem, OutlinedInput,
    TextField
} from "@mui/material";
import * as React from "react";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

export default function NewUser() {
    const navigate = useNavigate();

    const title = usePageTitle();

    const [user] = React.useState();
    const [groups, setGroup] = React.useState([]);

    const [tempPassword, setTempPassword] = React.useState(null);

    const roles = [
        { value: 'student', label: 'Student' },
        { value: 'teacher', label: 'Teacher' },
        { value: 'admin', label: 'Admin' },
    ];

    const [form, setForm] = React.useState({
        first_name: '',
        last_name: '',
        email: '',
        username: '',
        role: '',
        student_group: null,
        is_active: true,
    });

    const [emailError, setEmailError] = React.useState(false);
    const [roleError, setRoleError] = React.useState(false);

    const { showAlert } = useAlert();

    useEffect(() => {
        document.title = `${title} — DigiGrade`;
    }, [title]);

    React.useEffect(() => {
        fetch(`/api/studentGroups`, {
            credentials: 'include'
        })
            .then(res => res.json())
            .then(data => setGroup(data.results))
    }, [user]);

    function handleSubmit() {
        if (!form.email) {
            setEmailError(true);
            return Promise.reject('validation failed');
        }
        if (!form.role) {
            setRoleError(true);
            return Promise.reject('validation failed');
        }
        setEmailError(false);
        setRoleError(false);

        fetch(`/api/user/create`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(form)
        })
            .then(res => {
                if (!res.ok) {
                    showAlert('Something went wrong.', 'error');
                    throw new Error('failed');
                }
                showAlert('User updated successfully.', 'success');
                return res.json();
            })
            .then(data => {
                console.log("Data: " + data);
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
            <h1 className="title">New User</h1>

            <div className="flex flex-col md:w-1/2 self-center">
                <h3 className="mb-8 self-center">Personal information</h3>
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
                            setForm({ ...form, email: e.target.value, username: e.target.value });
                            if (e.target.value) setEmailError(false);
                        }}
                    />
                    <TextField
                        select
                        className="w-2/3"
                        label="Role"
                        value={form.role}
                        error={roleError}
                        helperText={roleError ? 'Role is required!' : ''}
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

            <div className="flex w-full justify-between mt-auto">
                <button className="button-primary min-w-fit my-2 md:w-1/12 w-1/6" onClick={() => navigate(-1)}>Back</button>
                <button className="button-primary min-w-fit my-2 md:w-1/12 w-1/6" onClick={handleSubmit}>Submit</button>
            </div>

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

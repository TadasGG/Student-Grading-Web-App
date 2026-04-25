import {useNavigate, useParams} from "react-router-dom";
import {usePageTitle} from "../hooks/usePageTitle.js";
import {useAlert} from '../context/AlertContext';
import {useEffect, useState} from "react";

import "../styles/main.css"
import "../styles/components.css"
import {Divider, FormControl, IconButton, InputAdornment, InputLabel, OutlinedInput, TextField} from "@mui/material";
import * as React from "react";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';

export default function MyProfile() {
    const navigate = useNavigate();

    const title = usePageTitle();

    const { id } = useParams();

    const [user, setUser] = React.useState();

    const [userForm, setUserForm] = React.useState({
        first_name: '',
        last_name: '',
        email: ''
    });

    const [passwordFocus, setPasswordFocus] = useState(false);
    const [passwordForm, setPasswordForm] = React.useState({
        current_password: '',
        new_password: '',
        confirm_password: '',
    });
    const [showCurrentPass, setShowCurrentPass] = useState(false);
    const [showNewPass, setShowNewPass] = useState(false);
    const [showConfirmPass, setShowConfirmPass] = useState(false);


    const [emailError, setEmailError] = React.useState(false);
    const { showAlert } = useAlert();

    useEffect(() => {
        document.title = `${title} — DigiGrade`;
    }, [title]);

    React.useEffect(() => {
        fetch(`/api/myprofile`, {
            credentials: 'include'
        })
            .then(res => res.json())
            .then(data => setUser(data))
    }, [id]);

    React.useEffect(() => {
        if (user) {
            setUserForm({
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                email: user.email || '',
            });
        }
    }, [user]);

    function handleApply() {
        if (!userForm.email) {
            setEmailError(true);
            return Promise.reject('validation failed');
        }
        setEmailError(false);

        return fetch(`/api/myprofile`, {
            method: 'PATCH',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userForm)
        })
        .then(res => {
            if (res.ok) {
                showAlert('Profile updated successfully.', 'success');
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

    const passwordChecks = validatePassword(passwordForm.new_password);
    function validatePassword(password) {
        return {
            hasLength: password.length > 7,
            hasUpper: /[A-Z]/.test(password),
            hasNumber: /[0-9]/.test(password),
            hasSymbol: /[^A-Za-z0-9]/.test(password),
        };
    }

    function handleChangePassword() {
        const checks = validatePassword(passwordForm.new_password);

        if (!Object.values(checks).every(Boolean)) {
            showAlert('Password does not meet all requirements!', 'error');
            return
        }

        if (passwordForm.new_password !== passwordForm.confirm_password) {
            showAlert('Passwords do not match!.', 'error');
            return
        }

        return fetch(`/api/myprofile/changepassword`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(passwordForm)
        })
            .then(res => {
                if (res.ok) {
                    passwordForm.current_password = ''
                    passwordForm.new_password = ''
                    passwordForm.confirm_password = ''
                    showAlert('Password changed successfully.', 'success');
                } else {
                    showAlert('Something went wrong.', 'error');
                    throw new Error('failed');
                }
            })
    }

    return (
        <div className="page-root flex flex-col">
            <div className="md:flex flex-1 min-h-0 gap-3.5 mt-5">
                <div className="flex flex-col md:w-1/2">
                    <h3 className="mb-8">Personal information</h3>
                    <div className="flex flex-col items-center gap-5">
                        <TextField
                            className="w-2/3"
                            label="First Name"
                            variant="outlined"
                            value={userForm.first_name}
                            onChange={(e) => setUserForm({ ...userForm, first_name: e.target.value })} />
                        <TextField
                            className="w-2/3"
                            label="Last Name"
                            variant="outlined"
                            value={userForm.last_name}
                            onChange={(e) => setUserForm({ ...userForm, last_name: e.target.value })} />
                        <TextField
                            className="w-2/3"
                            required
                            label="Email"
                            variant="outlined"
                            value={userForm.email}
                            error={emailError}
                            helperText={emailError ? 'Email is required!' : ''}
                            onChange={(e) => {
                                setUserForm({ ...userForm, email: e.target.value });
                                if (e.target.value) setEmailError(false);
                            }}
                        />
                    </div>
                    <div className="flex justify-center gap-10 mt-5 md:justify-end md:gap-2 md:mt-auto">
                        <button className="button-primary min-w-fit my-2 md:w-1/8 w-1/6" onClick={handleApply}>Apply</button>
                        <button className="button-primary min-w-fit my-2 md:w-1/8 w-1/6" onClick={handleSubmit}>Submit</button>
                    </div>
                </div>

                <Divider className="hidden md:block" orientation="vertical" flexItem sx={{ borderColor: 'rgba(0,0,0,0.4)' }} />
                <Divider className="block md:hidden p-2" orientation="horizontal" sx={{ borderColor: 'rgba(0,0,0,0.4)' }} />

                <div className="flex flex-col md:w-1/2" onFocus={() => {setPasswordFocus(true)}} onBlur={() => {setPasswordFocus(false)}}>
                    <h3 className="mb-8">Change password</h3>
                    <div className="flex flex-col items-center gap-5">
                        <FormControl className="w-2/3">
                            <InputLabel>Current Password</InputLabel>
                            <OutlinedInput
                                type={showCurrentPass ? "text" : "password"}
                                placeholder="••••••••"
                                value={passwordForm.current_password}
                                onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                                endAdornment={
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label={
                                                showCurrentPass ? 'hide the password' : 'display the password'
                                            }
                                            onClick={() => setShowCurrentPass(v => !v)}
                                            edge="end"
                                        >
                                            {showCurrentPass ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                        </IconButton>
                                    </InputAdornment>
                                }
                                label="Current Password"
                            />
                        </FormControl>
                        <FormControl className="w-2/3">
                            <InputLabel>New Password</InputLabel>
                            <OutlinedInput
                                type={showNewPass ? "text" : "password"}
                                placeholder="••••••••"
                                value={passwordForm.new_password}
                                onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                                endAdornment={
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label={
                                                showNewPass ? 'hide the password' : 'display the password'
                                            }
                                            onClick={() => setShowNewPass(v => !v)}
                                            edge="end"
                                        >
                                            {showNewPass ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                        </IconButton>
                                    </InputAdornment>
                                }
                                label="New Password"
                            />
                        </FormControl>

                        {passwordFocus && (
                            <div className="flex flex-col items-start w-2/3 text-gray-500 mt-[-20px]">
                                <p>New password must:</p>
                                <ul>
                                    <li className={passwordChecks.hasLength ? "text-green-700" : "text-red-700"}>
                                        {passwordChecks.hasLength ? <CheckIcon /> : <ClearIcon />} Be at least 8 characters long
                                    </li>
                                    <li className={passwordChecks.hasUpper ? "text-green-700" : "text-red-700"}>
                                        {passwordChecks.hasUpper ? <CheckIcon /> : <ClearIcon />} Have at least 1 upper case letter
                                    </li>
                                    <li className={passwordChecks.hasNumber ? "text-green-700" : "text-red-700"}>
                                        {passwordChecks.hasNumber ? <CheckIcon /> : <ClearIcon />} Have at least 1 number
                                    </li>
                                    <li className={passwordChecks.hasSymbol ? "text-green-700" : "text-red-700"}>
                                        {passwordChecks.hasSymbol ? <CheckIcon /> : <ClearIcon />} Have at least 1 symbol
                                    </li>
                                </ul>
                            </div>
                        )}

                        <FormControl className="w-2/3">
                            <InputLabel>Confirm Password</InputLabel>
                            <OutlinedInput
                                type={showConfirmPass ? "text" : "password"}
                                placeholder="••••••••"
                                value={passwordForm.confirm_password}
                                onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                                endAdornment={
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label={
                                                showConfirmPass ? 'hide the password' : 'display the password'
                                            }
                                            onClick={() => setShowConfirmPass(v => !v)}
                                            edge="end"
                                        >
                                            {showConfirmPass ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                        </IconButton>
                                    </InputAdornment>
                                }
                                label="Confirm Password"
                            />
                        </FormControl>
                    </div>
                    <div className="flex justify-center gap-10 mt-5 md:justify-end md:gap-2 md:mt-auto">
                        <button type="submit" className="button-primary min-w-fit my-2 md:w-1/8 w-1/6" onClick={handleChangePassword}>Submit</button>
                    </div>
                </div>
            </div>

            <div className="md:flex w-full justify-between mt-auto hidden">
                <button className="button-primary min-w-fit my-2 md:w-1/12 w-1/6" onClick={() => navigate(-1)}>Back</button>
            </div>
        </div>
    );
}

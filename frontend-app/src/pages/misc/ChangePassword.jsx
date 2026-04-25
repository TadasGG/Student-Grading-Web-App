import {useNavigate} from "react-router-dom";
import {usePageTitle} from "../../hooks/usePageTitle.js";
import {useAlert} from '../../context/AlertContext';
import {useEffect, useState} from "react";

import "../../styles/main.css"
import "../../styles/components.css"
import {FormControl, IconButton, InputAdornment, InputLabel, OutlinedInput} from "@mui/material";
import * as React from "react";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';

export default function ChangePassword() {
    const navigate = useNavigate();

    const title = usePageTitle();

    const [passwordForm, setPasswordForm] = React.useState({
        new_password: '',
        confirm_password: '',
    });
    const [showNewPass, setShowNewPass] = useState(false);
    const [showConfirmPass, setShowConfirmPass] = useState(false);

    const { showAlert } = useAlert();

    useEffect(() => {
        document.title = `${title} — DigiGrade`;
    }, [title]);

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

        return fetch(`/api/myprofile/changeforcedpassword`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(passwordForm)
        })
            .then(res => {
                if (res.ok) {
                    showAlert('Password changed successfully.', 'success');
                    navigate("/");
                } else {
                    showAlert('Something went wrong.', 'error');
                    throw new Error('failed');
                }
            })
    }

    return (
        <div className="page-root flex flex-col">
            <div className="flex flex-col self-center md:w-1/2">
                    <div className="flex flex-col items-center gap-5 mt-8">
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
                </div>

            <div className="md:flex w-full justify-center mt-8 hidden">
                <button className="button-primary min-w-fit my-2 md:w-1/12 w-1/6" onClick={handleChangePassword}>Submit</button>
            </div>
        </div>
    );
}

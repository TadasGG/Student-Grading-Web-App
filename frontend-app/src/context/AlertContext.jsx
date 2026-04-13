import * as React from 'react';
import {Alert, AlertTitle} from "@mui/material";

const AlertContext = React.createContext();

export function AlertProvider({ children }) {
    const [alert, setAlert] = React.useState(null);

    function showAlert(message, severity = 'success') {
        setAlert({ message, severity });
        setTimeout(() => setAlert(null), 3000);
    }

    return (
        <AlertContext.Provider value={{ showAlert }}>
            {children}
            {alert && (
                <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 9999 }}>
                    <Alert severity={alert.severity} onClose={() => setAlert(null)}>
                        <AlertTitle>{alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}!</AlertTitle>
                        {alert.message}
                    </Alert>
                </div>
            )}
        </AlertContext.Provider>
    );
}

export function useAlert() {
    return React.useContext(AlertContext);
}
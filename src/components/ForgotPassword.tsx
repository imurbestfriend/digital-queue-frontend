import { useState } from "react";
import axios from "axios";
import { TextField, Button, Box, Typography } from "@mui/material";
import styles from "../styles/auth.module.css";

const API_URL = import.meta.env.VITE_API_URL;

export default function ForgotPassword() {
    const [email, setEmail] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [success, setSuccess] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleForgotPassword = async () => {
        setIsLoading(true);
        setError(null);
        setSuccess(false);

        try {
            await axios.post(`${API_URL}/auth/forgot-password`, { email }, {
                headers: {
                    "Content-Type": "application/json",
                },
            });
            setSuccess(true);
        } catch (error) {
            console.error("Ошибка сброса пароля:", error);
            setError("Не удалось отправить письмо. Проверьте email и попробуйте снова.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Box className={styles.login}>
            <Typography variant="h5" sx={{ color: '#00004B', mb: 3 }}>
                Сброс пароля
            </Typography>
            
            <TextField
                fullWidth
                label="Email"
                variant="filled"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{
                    mb: 3,
                    '& .MuiFilledInput-root': {
                        paddingLeft: '12px',
                        paddingRight: '12px',
                    },
                    '& .MuiFilledInput-underline:before': {
                        borderBottomColor: '#00004B',
                    },
                    '& .MuiFilledInput-underline:after': {
                        borderBottomColor: '#00004B',
                    },
                    '& .Mui-focused': {
                        color: '#00004B',
                    }
                }}
            />
            
            <Button
                fullWidth
                variant="contained"
                onClick={handleForgotPassword}
                disabled={isLoading}
                sx={{
                    py: 2,
                    backgroundColor: '#00004B',
                    '&:hover': {
                        backgroundColor: '#1a1a6b',
                    },
                    '&:disabled': {
                        backgroundColor: '#cccccc',
                        color: '#666666',
                    },
                    textTransform: 'uppercase',
                    mb: 2
                }}
            >
                {isLoading ? "Отправка..." : "Отправить письмо"}
            </Button>
            
            {error && (
                <Typography color="error" sx={{ mt: 2, p: 1, backgroundColor: '#fdecea', borderRadius: 1, textAlign: 'center' }}>
                    {error}
                </Typography>
            )}
            
            {success && (
                <Typography sx={{ color: '#2e7d32', mt: 2, p: 1, backgroundColor: '#edf7ed', borderRadius: 1, textAlign: 'center' }}>
                    Письмо отправлено! Проверьте вашу почту.
                </Typography>
            )}
        </Box>
    );
}
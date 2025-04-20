import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import styles from "../styles/auth.module.css";

const API_URL = import.meta.env.VITE_API_URL;

export default function ResetPassword() {
    const [password, setPassword] = useState<string>("");
    const [confirmPassword, setConfirmPassword] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<boolean>(false);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const token = searchParams.get("token");

    const handleResetPassword = async () => {
        if (password !== confirmPassword) {
            setError("Пароли не совпадают");
            return;
        }

        setIsLoading(true);
        setError(null);
        setSuccess(false);

        try {
            await axios.post(`${API_URL}/auth/reset-password`, 
                { token, password }, 
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );
            setSuccess(true);
            setTimeout(() => navigate("/auth"), 3000); // Перенаправление на страницу авторизации
        } catch (error) {
            console.error("Ошибка сброса пароля:", error);
            setError("Не удалось сбросить пароль. Попробуйте снова.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.login}>
            <h2>Установите новый пароль</h2>
            <div className={styles.inputContainer}>
                <input
                    type="password"
                    placeholder="Введите новый пароль"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={styles.inputField}
                />
                <input
                    type="password"
                    placeholder="Подтвердите новый пароль"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={styles.inputField}
                />
            </div>
            <button
                onClick={handleResetPassword}
                disabled={isLoading}
                className={styles.loginBtn}
            >
                {isLoading ? "Сохранение..." : "Сохранить пароль"}
            </button>
            {error && <div className={styles.error}>{error}</div>}
            {success && <div className={styles.success}>Пароль успешно изменен! Перенаправление...</div>}
        </div>
    );
}
import { useState } from "react";
import axios from "axios";
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
        <div className={styles.login}>
            <h2>Сброс пароля</h2>
            <div className={styles.inputContainer}>
                <input
                    type="email"
                    placeholder="Введите ваш email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={styles.inputField}
                />
            </div>
            <button
                onClick={handleForgotPassword}
                disabled={isLoading}
                className={styles.loginBtn}
            >
                {isLoading ? "Отправка..." : "Отправить письмо"}
            </button>
            {error && <div className={styles.error}>{error}</div>}
            {success && <div className={styles.success}>Письмо отправлено! Проверьте вашу почту.</div>}
        </div>
    );
}